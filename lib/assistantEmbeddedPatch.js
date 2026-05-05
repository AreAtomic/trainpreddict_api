'use strict'

function clone(v) {
    return JSON.parse(JSON.stringify(v ?? []))
}

function sameYear(a, b) {
    return String(a) === String(b)
}

function normDayDate(d) {
    const s = String(d || '')
    if (s.includes('T')) return s.split('T')[0]
    return s.length >= 10 ? s.slice(0, 10) : s
}

function filterVal(arrayFilters, key) {
    const f = (arrayFilters || []).find((x) => x && x[key] !== undefined)
    return f ? f[key] : undefined
}

function dayMatchesFilter(day, arrayFilters) {
    const target = filterVal(arrayFilters, 'days.date')
    if (target === undefined) return true
    return normDayDate(day.date) === normDayDate(target)
}

function matchesDocumentFilter(filter, utilisateurId, years) {
    if (!filter) return true
    if (
        filter._utilisateur &&
        String(filter._utilisateur) !== String(utilisateurId)
    ) {
        return false
    }
    if (filter.years && filter.years.$elemMatch) {
        const em = filter.years.$elemMatch
        return (years || []).some((y) => sameYear(y.year, em.year))
    }
    return true
}

function applyDaysField(years, arrayFilters, field, value) {
    for (const y of years) {
        if (!y.weeks) continue
        for (const w of y.weeks) {
            if (!w.days) continue
            for (const d of w.days) {
                if (!dayMatchesFilter(d, arrayFilters)) continue
                d[field] = value
            }
        }
    }
    return years
}

function applyYearStat(years, arrayFilters, branch, value) {
    const yv = filterVal(arrayFilters, 'years.year')
    for (const y of years) {
        if (!sameYear(y.year, yv)) continue
        if (!y.statistiques) y.statistiques = { planned: {}, done: {} }
        y.statistiques[branch] = value
    }
    return years
}

function applyWeekStat(years, arrayFilters, branch, value) {
    const wv = filterVal(arrayFilters, 'weeks.week')
    for (const y of years) {
        if (!y.weeks) continue
        for (const w of y.weeks) {
            if (Number(w.week) !== Number(wv)) continue
            if (!w.statistiques) w.statistiques = { planned: {}, done: {} }
            w.statistiques[branch] = value
        }
    }
    return years
}

function applyDayStat(years, arrayFilters, branch, value) {
    for (const y of years) {
        if (!y.weeks) continue
        for (const w of y.weeks) {
            if (!w.days) continue
            for (const d of w.days) {
                if (!dayMatchesFilter(d, arrayFilters)) continue
                if (!d.statistiques) d.statistiques = { planned: {}, done: {} }
                d.statistiques[branch] = value
            }
        }
    }
    return years
}

function replaceYearByFilter(years, arrayFilters, newYearObj) {
    const yv = filterVal(arrayFilters, 'years.year')
    const idx = years.findIndex((y) => sameYear(y.year, yv))
    if (idx >= 0) years[idx] = newYearObj
    else years.push(newYearObj)
    return years
}

function applyPath(years, path, value, arrayFilters) {
    switch (path) {
        case 'years':
            return clone(value)
        case 'years.$[].weeks.$[].days.$[days].planned':
            return applyDaysField(years, arrayFilters, 'planned', value)
        case 'years.$[].weeks.$[].days.$[days].done':
            return applyDaysField(years, arrayFilters, 'done', value)
        case 'years.$[].weeks.$[].days.$[days].comment':
            return applyDaysField(years, arrayFilters, 'comment', value)
        case 'years.$[].weeks.$[].days.$[days].objectif':
            return applyDaysField(years, arrayFilters, 'objectif', value)
        case 'years.$[years].statistiques.planned':
            return applyYearStat(years, arrayFilters, 'planned', value)
        case 'years.$[years].statistiques.done':
            return applyYearStat(years, arrayFilters, 'done', value)
        case 'years.$[years]':
            return replaceYearByFilter(years, arrayFilters, value)
        case 'years.$[].weeks.$[weeks].statistiques.planned':
            return applyWeekStat(years, arrayFilters, 'planned', value)
        case 'years.$[].weeks.$[weeks].statistiques.done':
            return applyWeekStat(years, arrayFilters, 'done', value)
        case 'years.$[].weeks.$[].days.$[days].statistiques.planned':
            return applyDayStat(years, arrayFilters, 'planned', value)
        case 'years.$[].weeks.$[].days.$[days].statistiques.done':
            return applyDayStat(years, arrayFilters, 'done', value)
        default:
            console.warn('[assistantEmbeddedPatch] unsupported $set path', path)
            return years
    }
}

function applySetOnYears(years, $set, arrayFilters) {
    if (!$set || typeof $set !== 'object') return years
    let out = Array.isArray(years) ? clone(years) : []
    for (const [path, val] of Object.entries($set)) {
        out = applyPath(out, path, val, arrayFilters || [])
    }
    return out
}

module.exports = {
    clone,
    sameYear,
    matchesDocumentFilter,
    applySetOnYears,
}
