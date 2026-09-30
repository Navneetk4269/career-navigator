import { calculateLoginStreak } from './login-streak';

describe('calculateLoginStreak', () => {
    it('starts at one on the first login', () => {
        expect(calculateLoginStreak(0, null, new Date('2025-01-10T12:00:00Z')))
            .toBe(1);
    });

    it('keeps the streak unchanged for another login on the same UTC day', () => {
        expect(calculateLoginStreak(
            5,
            new Date('2025-01-10T07:00:00Z'),
            new Date('2025-01-10T18:00:00Z'),
        )).toBe(5);
    });

    it('increments on consecutive UTC days across the spring DST transition', () => {
        expect(calculateLoginStreak(
            2,
            new Date('2025-03-09T05:30:00Z'),
            new Date('2025-03-10T04:30:00Z'),
        )).toBe(3);
    });

    it('increments on consecutive UTC days across the fall DST transition', () => {
        expect(calculateLoginStreak(
            3,
            new Date('2025-11-02T04:30:00Z'),
            new Date('2025-11-03T05:30:00Z'),
        )).toBe(4);
    });

    it('resets after a missed UTC day or a future-dated login', () => {
        expect(calculateLoginStreak(
            5,
            new Date('2025-01-10T12:00:00Z'),
            new Date('2025-01-12T12:00:00Z'),
        )).toBe(1);
        expect(calculateLoginStreak(
            5,
            new Date('2025-01-11T12:00:00Z'),
            new Date('2025-01-10T12:00:00Z'),
        )).toBe(1);
    });
});