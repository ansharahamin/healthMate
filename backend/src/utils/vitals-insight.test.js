import test from 'node:test'
import assert from 'node:assert/strict'
import { formatVitalsForInsight, isVitalsInsight } from './vitals-insight.js'

test('formats chronological readings without user ids or free-text notes', () => {
    const readings = formatVitalsForInsight([
        {
            _id: 'later',
            userId: 'private-user-id',
            type: 'blood-sugar',
            value: 95,
            unit: 'mg/dL',
            recordedAt: new Date('2026-10-10T08:00:00Z'),
            notes: 'private note',
        },
        {
            _id: 'earlier',
            userId: 'private-user-id',
            type: 'blood-pressure',
            systolic: 130,
            diastolic: 80,
            unit: 'mmHg',
            recordedAt: new Date('2026-10-09T08:00:00Z'),
            notes: 'another private note',
        },
    ])

    assert.deepEqual(readings, [
        {
            type: 'blood-pressure',
            unit: 'mmHg',
            recordedAt: '2026-10-09T08:00:00.000Z',
            systolic: 130,
            diastolic: 80,
        },
        {
            type: 'blood-sugar',
            unit: 'mg/dL',
            recordedAt: '2026-10-10T08:00:00.000Z',
            value: 95,
        },
    ])
})

test('rejects malformed or incomplete generated vitals insights', () => {
    const insight = {
        summaryEnglish: 'Summary',
        summaryRomanUrdu: 'Khulasa',
        observations: [],
        suggestions: [],
        doctorQuestions: ['Question 1', 'Question 2', 'Question 3'],
    }

    assert.equal(isVitalsInsight(insight), true)
    assert.equal(isVitalsInsight({ ...insight, doctorQuestions: ['Only one'] }), false)
    assert.equal(isVitalsInsight({ ...insight, suggestions: [1] }), false)
})
