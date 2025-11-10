import { ref } from 'vue'

export type Language = 'en' | 'sq'

export const translations = {
  en: {
    planningTrip: 'Planning a Trip',
    alreadyInside: 'Already Inside',
    pastSchengenEntries: 'Past Schengen Entries',
    entryDate: 'Entry Date',
    exitDate: 'Exit Date',
    addEntry: 'Add Entry',
    tripPlanning: 'Trip Planning',
    plannedEntryDate: 'Planned Entry Date *',
    plannedExitDate: 'Planned Exit Date (Optional)',
    calculate: 'Calculate',
    results: 'Results',
    daysLeftInEU: 'Days Left in EU',
    tripStatus: 'Trip Status',
    valid: 'VALID',
    invalid: 'INVALID',
    daysUsedOnEntry: 'Days used on entry:',
    daysRemainingOnEntry: 'Days remaining on entry:',
    latestSafeExit: 'Latest safe exit:',
    requiredExitDate: 'Required exit date:',
    daysRemainingAfterTrip: 'Days remaining after trip:',
    currentStay: 'Current Stay',
    lastEntryDate: 'Last Entry Date *',
    daysUsed: 'Days Used',
    pleaseEnterPlannedEntry: 'Please enter a planned entry date',
    pleaseEnterLastEntry: 'Please enter your last entry date',
    completeBothDates: 'Please complete both entry and exit dates for past stay #',
    entryAfterExit: 'Entry date cannot be after exit date',
    exitBeforeEntry: 'Exit date cannot be before entry date',
    bothDatesRequired: 'Both entry and exit dates are required',
    pastEntryFuture: 'Past entry date cannot be in the future',
    pastExitFuture: 'Past exit date cannot be in the future',
    plannedEntryTooPast: 'Planned entry date cannot be more than 2 years in the past',
    lastEntryFuture: 'Last entry date cannot be in the future',
    lastEntryTooPast: 'Last entry date cannot be more than 10 years in the past',
    welcomeTitle: 'Welcome to Schengen Planner',
    welcomeDescription: 'Plan your travels with confidence. Calculate your remaining Schengen days using the 90/180 day rule. Track your past entries and plan future trips to stay compliant with Schengen visa regulations.',
    welcomeGetStarted: 'Get Started',
    welcomeDismiss: 'Dismiss',
    footerText: '© 2025 Schengen Planner. Plan your travels with confidence.',
  },
  sq: {
    planningTrip: 'Duke Planifikuar një Udhëtim',
    alreadyInside: 'Tashmë Brenda',
    pastSchengenEntries: 'Hyrjet e Kaluara në Schengen',
    entryDate: 'Data e Hyrjes',
    exitDate: 'Data e Daljes',
    addEntry: 'Shto Hyrje',
    tripPlanning: 'Planifikimi i Udhëtimit',
    plannedEntryDate: 'Data e Planifikuar e Hyrjes *',
    plannedExitDate: 'Data e Planifikuar e Daljes (Opsionale)',
    calculate: 'Llogarit',
    results: 'Rezultatet',
    daysLeftInEU: 'Ditët e Mbetura në BE',
    tripStatus: 'Statusi i Udhëtimit',
    valid: 'I VLEFSHËM',
    invalid: 'I PAVLEFSHËM',
    daysUsedOnEntry: 'Ditët e përdorura në hyrje:',
    daysRemainingOnEntry: 'Ditët e mbetura në hyrje:',
    latestSafeExit: 'Dalja më e sigurt:',
    requiredExitDate: 'Data e kërkuar e daljes:',
    daysRemainingAfterTrip: 'Ditët e mbetura pas udhëtimit:',
    currentStay: 'Qëndrimi Aktual',
    lastEntryDate: 'Data e Fundit e Hyrjes *',
    daysUsed: 'Ditët e Përdorura',
    pleaseEnterPlannedEntry: 'Ju lutem shkruani datën e planifikuar të hyrjes',
    pleaseEnterLastEntry: 'Ju lutem shkruani datën tuaj të fundit të hyrjes',
    completeBothDates: 'Ju lutem plotësoni të dyja datat e hyrjes dhe daljes për qëndrimin e kaluar #',
    entryAfterExit: 'Data e hyrjes nuk mund të jetë pas datës së daljes',
    exitBeforeEntry: 'Data e daljes nuk mund të jetë para datës së hyrjes',
    bothDatesRequired: 'Të dyja datat e hyrjes dhe daljes janë të nevojshme',
    pastEntryFuture: 'Data e hyrjes së kaluar nuk mund të jetë në të ardhmen',
    pastExitFuture: 'Data e daljes së kaluar nuk mund të jetë në të ardhmen',
    plannedEntryTooPast: 'Data e planifikuar e hyrjes nuk mund të jetë më shumë se 2 vjet në të kaluarën',
    lastEntryFuture: 'Data e fundit e hyrjes nuk mund të jetë në të ardhmen',
    lastEntryTooPast: 'Data e fundit e hyrjes nuk mund të jetë më shumë se 10 vjet në të kaluarën',
    welcomeTitle: 'Mirë se vini në Planifikuesin e Schengen',
    welcomeDescription: 'Planifikoni udhëtimet tuaja me besim. Llogaritni ditët tuaja të mbetura në Schengen duke përdorur rregullin 90/180 ditë. Ndiqni hyrjet tuaja të kaluara dhe planifikoni udhëtimet e ardhshme për të qëndruar në përputhje me rregullat e vizës së Schengen.',
    welcomeGetStarted: 'Filloni',
    welcomeDismiss: 'Mbyll',
    footerText: '© 2025 Planifikuesi i Schengen. Planifikoni udhëtimet tuaja me besim.',
  }
}

export function useTranslations() {
  const language = ref<Language>('en')
  
  // Load from localStorage
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('schengo-language')
    if (saved === 'sq' || saved === 'en') {
      language.value = saved
    }
  }
  
  const t = (key: keyof typeof translations.en): string => {
    return translations[language.value][key] || key
  }
  
  const setLanguage = (lang: Language) => {
    language.value = lang
    if (typeof window !== 'undefined') {
      localStorage.setItem('schengo-language', lang)
    }
  }
  
  return { language, t, setLanguage }
}

