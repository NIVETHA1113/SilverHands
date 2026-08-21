import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import ProgressIndicator from '../components/onboarding/ProgressIndicator';
import StepAboutYou from '../components/onboarding/StepAboutYou';
import StepSkills from '../components/onboarding/StepSkills';
import StepLocation from '../components/onboarding/StepLocation';
import StepLanguages from '../components/onboarding/StepLanguages';
import StepPreferences from '../components/onboarding/StepPreferences';
import StepReview from '../components/onboarding/StepReview';
import { CheckCircle2, ArrowRight } from 'lucide-react';

export default function OnboardingPage() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(user?.onboarding?.currentStep || 1);
  const [profileData, setProfileData] = useState({
    name:            user?.name            || '',
    age:             user?.age             || 58,
    phone:           user?.phone           || '',
    profileImage:    user?.profileImage    || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=250',
    bio:             user?.bio             || '',
    skills:          user?.skills          || [],
    location:        user?.location        || { city: '', state: '', country: 'India', address: '', latitude: null, longitude: null },
    languages:       user?.languages       || ['English', 'Tamil'],
    workPreferences: user?.workPreferences || ['Home-based'],
    interestedIn:    user?.interestedIn    || ['Services', 'Flexible Work'],
    availability:    user?.availability    || {
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      timePreferences: ['Flexible']
    }
  });

  const [isCompleted, setIsCompleted] = useState(user?.onboarding?.completed || false);
  const [loading, setLoading] = useState(false);

  // Resume at saved step on mount
  useEffect(() => {
    if (user?.onboarding?.currentStep) {
      setCurrentStep(user.onboarding.currentStep);
    }
  }, [user]);

  // Save progress helper
  const saveProgress = async (updatedFields, nextStep, markCompleted = false) => {
    const merged = { ...profileData, ...updatedFields };
    setProfileData(merged);

    if (user?._id || user?.id) {
      const uId = user._id || user.id;
      try {
        setLoading(true);

        // Save profile to DB
        const profileRes = await api.put(`/users/${uId}/profile`, merged);

        // Update onboarding step/status
        await api.put(`/users/${uId}/onboarding`, {
          completed: markCompleted,
          currentStep: nextStep
        });

        // --- KEY FIX: push saved data back into AuthContext so the rest
        // of the app (Dashboard, LocationMapModal, Navbar) sees fresh data
        // without requiring a page reload.
        if (profileRes.data?.user) {
          // Prefer the server's canonical response
          updateUser(profileRes.data.user);
        } else {
          // Fall back to merging what we sent
          updateUser({
            ...merged,
            onboarding: { completed: markCompleted, currentStep: nextStep }
          });
        }
      } catch (err) {
        console.error('[Autosave Error]:', err.message);
        // Still update context optimistically so UX isn't broken
        updateUser({
          ...merged,
          onboarding: { completed: markCompleted, currentStep: nextStep }
        });
      } finally {
        setLoading(false);
      }
    }

    if (markCompleted) {
      setIsCompleted(true);
    } else {
      setCurrentStep(nextStep);
    }
  };

  const handleStepNext = (stepData) => {
    const next = Math.min(6, currentStep + 1);
    saveProgress(stepData, next, false);
  };

  const handleStepBack = () => {
    setCurrentStep(prev => Math.max(1, prev - 1));
  };

  const handleFinalComplete = () => {
    saveProgress({}, 6, true);
  };

  return (
    <div className="min-h-screen bg-[#FBF9F4] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* COMPLETED CELEBRATION VIEW */}
        {isCompleted ? (
          <div className="bg-white p-8 sm:p-12 rounded-3xl border border-[#E2E7E3] shadow-md text-center space-y-6 max-w-2xl mx-auto my-8">
            <div className="w-20 h-20 bg-[#E6ECE7] text-[#16382B] rounded-full flex items-center justify-center mx-auto shadow-inner border border-[#D2DDD5]">
              <CheckCircle2 className="w-10 h-10 text-[#16382B]" />
            </div>

            <div className="space-y-2">
              <span className="badge-sage uppercase tracking-widest text-xs">
                Profile Setup Complete
              </span>
              <h1 className="font-editorial text-4xl font-bold text-[#16382B]">
                Your SilverHands profile is ready! 🎉
              </h1>
              <p className="text-slate-600 text-base max-w-lg mx-auto">
                You're now ready to discover opportunities that match your traditional skills and experience.
              </p>
            </div>

            <div className="bg-[#FBF9F4] p-4 rounded-2xl border border-[#E2E7E3] inline-block px-8">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Profile Completion</p>
              <p className="font-editorial text-3xl font-bold text-[#16382B] mt-0.5">100%</p>
            </div>

            <div>
              <button
                onClick={() => navigate('/dashboard')}
                className="btn-primary py-3.5 px-8 text-base shadow-md"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* MULTI-STEP WIZARD CONTAINER */
          <div className="space-y-6">
            <ProgressIndicator
              currentStep={currentStep}
              onStepClick={(sId) => setCurrentStep(sId)}
            />

            <div className="bg-white p-6 sm:p-10 rounded-3xl border border-[#E2E7E3] shadow-sm">
              {currentStep === 1 && (
                <StepAboutYou data={profileData} onNext={handleStepNext} />
              )}
              {currentStep === 2 && (
                <StepSkills data={profileData} onNext={handleStepNext} onBack={handleStepBack} />
              )}
              {currentStep === 3 && (
                <StepLocation data={profileData} onNext={handleStepNext} onBack={handleStepBack} />
              )}
              {currentStep === 4 && (
                <StepLanguages data={profileData} onNext={handleStepNext} onBack={handleStepBack} />
              )}
              {currentStep === 5 && (
                <StepPreferences data={profileData} onNext={handleStepNext} onBack={handleStepBack} />
              )}
              {currentStep === 6 && (
                <StepReview
                  data={profileData}
                  onComplete={handleFinalComplete}
                  onGoToStep={(sId) => setCurrentStep(sId)}
                  loading={loading}
                />
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
