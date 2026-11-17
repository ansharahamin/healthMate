function formatVitalsForInsight(vitals) {
    return vitals.map((vital) => {
        const reading = {
            type: vital.type,
            unit: vital.unit,
            recordedAt: new Date(vital.recordedAt).toISOString(),
        }

        if (vital.type === 'blood-pressure') {
            reading.systolic = vital.systolic
            reading.diastolic = vital.diastolic
        } else {
            reading.value = vital.value
        }

        return reading
    }).sort((a, b) => Date.parse(a.recordedAt) - Date.parse(b.recordedAt))
}

function isVitalsInsight(value) {
    return value !== null
        && typeof value === 'object'
        && typeof value.summaryEnglish === 'string'
        && value.summaryEnglish.trim() !== ''
        && typeof value.summaryRomanUrdu === 'string'
        && value.summaryRomanUrdu.trim() !== ''
        && Array.isArray(value.observations)
        && value.observations.every((item) => typeof item === 'string' && item.trim() !== '')
        && Array.isArray(value.suggestions)
        && value.suggestions.every((item) => typeof item === 'string' && item.trim() !== '')
        && Array.isArray(value.doctorQuestions)
        && value.doctorQuestions.length >= 3
        && value.doctorQuestions.length <= 5
        && value.doctorQuestions.every((item) => typeof item === 'string' && item.trim() !== '')
}

export { formatVitalsForInsight, isVitalsInsight }
