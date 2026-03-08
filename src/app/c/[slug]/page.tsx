import { notFound } from 'next/navigation'
import { getCampaignBySlug } from '@/lib/evergreen/queries'
import { CountdownTimer } from '@/components/evergreen/countdown-timer'
import { RegistrationForm } from '@/components/evergreen/registration-form'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const campaign = await getCampaignBySlug(slug)
  if (!campaign) return { title: 'Not Found' }

  return {
    title: campaign.lp_settings.headline || campaign.name,
    description: campaign.description ?? undefined,
  }
}

export default async function CampaignLandingPage({ params }: Props) {
  const { slug } = await params
  const campaign = await getCampaignBySlug(slug)

  if (!campaign) notFound()

  const { lp_settings, sessions } = campaign
  const nextSession = sessions[0]

  return (
    <div className="min-h-dvh bg-eg-bg-light font-eg-body">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-eg-primary px-4 py-16 sm:py-24">
        <div className="absolute inset-0 bg-gradient-to-b from-eg-primary to-eg-secondary" />
        <div className="relative mx-auto max-w-4xl text-center">
          {nextSession && (
            <div className="mb-8">
              <p className="mb-4 font-eg-heading text-sm font-medium uppercase tracking-widest text-white/70">
                次回のセッションまであと
              </p>
              <div className="inline-block rounded-2xl bg-white/10 px-8 py-6 backdrop-blur-sm">
                <CountdownTimer
                  targetDate={nextSession.starts_at}
                  size="lg"
                />
              </div>
            </div>
          )}

          <h1 className="mt-8 font-eg-display text-3xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
            {lp_settings.headline || campaign.name}
          </h1>

          {lp_settings.subheadline && (
            <p className="mx-auto mt-6 max-w-2xl text-lg text-white/80 sm:text-xl">
              {lp_settings.subheadline}
            </p>
          )}
        </div>
      </section>

      {/* Session Selection + Registration */}
      <section id="register" className="px-4 py-16 sm:py-24">
        <div className="mx-auto max-w-4xl">
          <RegistrationForm
            campaignSlug={slug}
            sessions={sessions}
            ctaText={lp_settings.cta_text || '無料で参加する'}
          />
        </div>
      </section>

      {/* Benefits */}
      {lp_settings.benefits.length > 0 && (
        <section className="border-t border-gray-100 bg-white px-4 py-16 sm:py-24">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-12 text-center font-eg-heading text-2xl font-semibold text-eg-primary sm:text-3xl">
              このセッションで得られること
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {lp_settings.benefits.map((benefit, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 rounded-xl border border-gray-100 bg-eg-bg-light p-6"
                >
                  <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-eg-accent/10">
                    <svg className="h-4 w-4 text-eg-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="font-eg-body text-eg-text-primary">{benefit}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      {lp_settings.testimonials.length > 0 && (
        <section className="border-t border-gray-100 px-4 py-16 sm:py-24">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-12 text-center font-eg-heading text-2xl font-semibold text-eg-primary sm:text-3xl">
              参加者の声
            </h2>
            <div className="grid gap-6 sm:grid-cols-2">
              {lp_settings.testimonials.map((t, i) => (
                <blockquote
                  key={i}
                  className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm"
                >
                  <p className="font-eg-body text-eg-text-primary leading-relaxed">
                    &ldquo;{t.text}&rdquo;
                  </p>
                  <footer className="mt-4 flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-eg-primary/10 font-eg-heading text-sm font-semibold text-eg-primary">
                      {t.name[0]}
                    </div>
                    <div>
                      <p className="font-eg-heading text-sm font-medium text-eg-primary">
                        {t.name}
                      </p>
                      {t.role && (
                        <p className="text-xs text-eg-text-secondary">{t.role}</p>
                      )}
                    </div>
                  </footer>
                </blockquote>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer CTA */}
      <section className="border-t border-gray-100 bg-eg-primary px-4 py-12">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-eg-heading text-xl font-semibold text-white">
            今すぐ席を確保しましょう
          </p>
          <a
            href="#register"
            className="mt-6 inline-block rounded-lg bg-eg-accent px-10 py-4 font-eg-heading text-lg font-bold text-white
              shadow-md transition-all duration-200 hover:bg-eg-accent/90 hover:shadow-lg"
          >
            {lp_settings.cta_text || '無料で参加する'}
          </a>
        </div>
      </section>
    </div>
  )
}
