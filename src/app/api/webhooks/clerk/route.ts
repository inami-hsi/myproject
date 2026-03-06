import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'

interface ClerkEmailAddress {
  email_address: string
  id: string
}

interface ClerkUserEvent {
  id: string
  email_addresses: ClerkEmailAddress[]
  primary_email_address_id: string
  first_name: string | null
  last_name: string | null
  image_url: string | null
}

interface ClerkWebhookEvent {
  data: ClerkUserEvent
  type: string
}

export async function POST(request: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: 'CLERK_WEBHOOK_SECRET is not configured' },
      { status: 500 }
    )
  }

  // Get the headers for verification
  const headerPayload = await headers()
  const svixId = headerPayload.get('svix-id')
  const svixTimestamp = headerPayload.get('svix-timestamp')
  const svixSignature = headerPayload.get('svix-signature')

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json(
      { error: 'Missing svix headers' },
      { status: 400 }
    )
  }

  // Get the body
  const payload = await request.json()
  const body = JSON.stringify(payload)

  // Verify the webhook signature
  const wh = new Webhook(WEBHOOK_SECRET)
  let event: ClerkWebhookEvent

  try {
    event = wh.verify(body, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as ClerkWebhookEvent
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }

  const { type, data } = event
  const supabase = createServiceRoleClient()

  try {
    switch (type) {
      case 'user.created': {
        const primaryEmail = data.email_addresses.find(
          (e) => e.id === data.primary_email_address_id
        )

        if (!primaryEmail) {
          console.error('No primary email found for user:', data.id)
          return NextResponse.json(
            { error: 'No primary email found' },
            { status: 400 }
          )
        }

        const { error } = await supabase.from('users').upsert(
          {
            clerk_user_id: data.id,
            email: primaryEmail.email_address,
            plan: 'free',
            status: 'active',
          },
          { onConflict: 'clerk_user_id' }
        )

        if (error) {
          console.error('Failed to upsert user:', error)
          return NextResponse.json(
            { error: 'Database error' },
            { status: 500 }
          )
        }

        break
      }

      case 'user.updated': {
        const updatedEmail = data.email_addresses.find(
          (e) => e.id === data.primary_email_address_id
        )

        if (updatedEmail) {
          const { error } = await supabase
            .from('users')
            .update({ email: updatedEmail.email_address })
            .eq('clerk_user_id', data.id)

          if (error) {
            console.error('Failed to update user:', error)
            return NextResponse.json(
              { error: 'Database error' },
              { status: 500 }
            )
          }
        }

        break
      }

      case 'user.deleted': {
        const { error } = await supabase
          .from('users')
          .update({ status: 'deleted' })
          .eq('clerk_user_id', data.id)

        if (error) {
          console.error('Failed to mark user as deleted:', error)
          return NextResponse.json(
            { error: 'Database error' },
            { status: 500 }
          )
        }

        break
      }

      default: {
        console.log(`Unhandled webhook event type: ${type}`)
      }
    }

    return NextResponse.json({ received: true }, { status: 200 })
  } catch (err) {
    console.error('Webhook handler error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
