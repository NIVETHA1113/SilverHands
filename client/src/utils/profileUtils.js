/**
 * Calculates profile completion percentage dynamically.
 * Sections:
 * 1. Basic Info (name, age, phone) -> 16.66%
 * 2. Skills (at least 1 skill) -> 16.66%
 * 3. Location (city) -> 16.66%
 * 4. Languages (at least 1 language) -> 16.66%
 * 5. Work Preferences (workPreferences or interestedIn) -> 16.66%
 * 6. Availability (at least 1 day selected) -> 16.70%
 */
export const calculateProfileCompletion = (user) => {
  if (!user) return 0;
  if (user.onboarding?.completed) return 100;

  let completedSections = 0;
  const totalSections = 6;

  // 1. Basic Info
  if (user.name && user.age && user.phone) {
    completedSections += 1;
  }

  // 2. Skills
  if (user.skills && Array.isArray(user.skills) && user.skills.length > 0) {
    completedSections += 1;
  }

  // 3. Location
  if (user.location && user.location.city) {
    completedSections += 1;
  }

  // 4. Languages
  if (user.languages && Array.isArray(user.languages) && user.languages.length > 0) {
    completedSections += 1;
  }

  // 5. Work Preferences
  if ((user.workPreferences && user.workPreferences.length > 0) || (user.interestedIn && user.interestedIn.length > 0)) {
    completedSections += 1;
  }

  // 6. Availability
  if (user.availability && Array.isArray(user.availability.days) && user.availability.days.length > 0) {
    completedSections += 1;
  }

  return Math.min(100, Math.round((completedSections / totalSections) * 100));
};
