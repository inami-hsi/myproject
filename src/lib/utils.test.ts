import { describe, it, expect } from 'vitest';
import { cn, scoreToStars, matchScoreToIcon, formatDaysDiff, objectToQueryString } from './utils';

describe('utils.ts', () => {
  describe('cn', () => {
    it('複数のクラスを結合する', () => {
      expect(cn('class1', 'class2', 'class3')).toBe('class1 class2 class3');
    });

    it('undefinedをフィルタリングする', () => {
      expect(cn('class1', undefined, 'class2')).toBe('class1 class2');
    });

    it('nullをフィルタリングする', () => {
      expect(cn('class1', null, 'class2')).toBe('class1 class2');
    });

    it('falseをフィルタリングする', () => {
      expect(cn('class1', false, 'class2')).toBe('class1 class2');
    });

    it('空文字列を含める', () => {
      // 空文字列はfilterでfalsyなので除外される
      expect(cn('class1', '', 'class2')).toBe('class1 class2');
    });

    it('引数なしで空文字列を返す', () => {
      expect(cn()).toBe('');
    });

    it('条件付きクラス名を扱える', () => {
      const isActive = true;
      const isDisabled = false;
      expect(cn('base', isActive && 'active', isDisabled && 'disabled')).toBe('base active');
    });
  });

  describe('scoreToStars', () => {
    it('100点で5つ星', () => {
      expect(scoreToStars(100)).toBe('★★★★★');
    });

    it('80点で4つ星', () => {
      expect(scoreToStars(80)).toBe('★★★★☆');
    });

    it('60点で3つ星', () => {
      expect(scoreToStars(60)).toBe('★★★☆☆');
    });

    it('40点で2つ星', () => {
      expect(scoreToStars(40)).toBe('★★☆☆☆');
    });

    it('20点で1つ星', () => {
      expect(scoreToStars(20)).toBe('★☆☆☆☆');
    });

    it('0点で0つ星', () => {
      expect(scoreToStars(0)).toBe('☆☆☆☆☆');
    });

    it('90点で5つ星（四捨五入）', () => {
      expect(scoreToStars(90)).toBe('★★★★★');
    });

    it('50点で3つ星（四捨五入）', () => {
      expect(scoreToStars(50)).toBe('★★★☆☆');
    });

    it('10点で1つ星（四捨五入）', () => {
      expect(scoreToStars(10)).toBe('★☆☆☆☆');
    });
  });

  describe('matchScoreToIcon', () => {
    it('90点以上で緑アイコン', () => {
      expect(matchScoreToIcon(90)).toBe('🟢');
      expect(matchScoreToIcon(95)).toBe('🟢');
      expect(matchScoreToIcon(100)).toBe('🟢');
    });

    it('75-89点で黄色アイコン', () => {
      expect(matchScoreToIcon(75)).toBe('🟡');
      expect(matchScoreToIcon(80)).toBe('🟡');
      expect(matchScoreToIcon(89)).toBe('🟡');
    });

    it('75点未満でオレンジアイコン', () => {
      expect(matchScoreToIcon(74)).toBe('🟠');
      expect(matchScoreToIcon(50)).toBe('🟠');
      expect(matchScoreToIcon(0)).toBe('🟠');
    });
  });

  describe('formatDaysDiff', () => {
    it('同じ日は「今日」', () => {
      const today = new Date();
      expect(formatDaysDiff(today, today)).toBe('今日');
    });

    it('1日前は「昨日」', () => {
      const today = new Date();
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      expect(formatDaysDiff(yesterday, today)).toBe('昨日');
    });

    it('3日前は「3日前」', () => {
      const today = new Date();
      const threeDaysAgo = new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000);
      expect(formatDaysDiff(threeDaysAgo, today)).toBe('3日前');
    });

    it('7日前は「1週前」', () => {
      const today = new Date();
      const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      expect(formatDaysDiff(oneWeekAgo, today)).toBe('1週前');
    });

    it('14日前は「2週前」', () => {
      const today = new Date();
      const twoWeeksAgo = new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000);
      expect(formatDaysDiff(twoWeeksAgo, today)).toBe('2週前');
    });

    it('30日前は「1ヶ月前」', () => {
      const today = new Date();
      const oneMonthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
      expect(formatDaysDiff(oneMonthAgo, today)).toBe('1ヶ月前');
    });

    it('60日前は「2ヶ月前」', () => {
      const today = new Date();
      const twoMonthsAgo = new Date(today.getTime() - 60 * 24 * 60 * 60 * 1000);
      expect(formatDaysDiff(twoMonthsAgo, today)).toBe('2ヶ月前');
    });
  });

  describe('objectToQueryString', () => {
    it('単純なオブジェクトをクエリ文字列に変換', () => {
      const obj = { name: 'test', value: 123 };
      expect(objectToQueryString(obj)).toBe('name=test&value=123');
    });

    it('配列値を複数パラメータとして展開', () => {
      const obj = { tags: ['a', 'b', 'c'] };
      expect(objectToQueryString(obj)).toBe('tags=a&tags=b&tags=c');
    });

    it('nullとundefinedを除外', () => {
      const obj = { name: 'test', empty: null, missing: undefined, value: 0 };
      expect(objectToQueryString(obj)).toBe('name=test&value=0');
    });

    it('空のオブジェクトは空文字列', () => {
      expect(objectToQueryString({})).toBe('');
    });

    it('数値と文字列を正しく変換', () => {
      const obj = { str: 'hello', num: 42, bool: true };
      expect(objectToQueryString(obj)).toBe('str=hello&num=42&bool=true');
    });

    it('特殊文字をエンコード', () => {
      const obj = { query: 'hello world', special: '日本語' };
      const result = objectToQueryString(obj);
      expect(result).toContain('query=hello+world');
      expect(result).toContain('special=');
    });
  });
});
