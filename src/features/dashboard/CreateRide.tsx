import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, CheckCircle2, ChevronDown, Calendar, MapPin, Map, FileCode } from 'lucide-react';
import { toast } from 'sonner';
import gsap from 'gsap';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { useAppSelector } from '@/hooks/useAppSelector';
import { updateStepFields, setStep, resetRideForm } from '@/features/club/slices/addRideSlice';
import { backendApi } from '@/api/backendApi';
import { useActiveClub } from '@/hooks/useActiveClub';
import { ROUTES } from '@/Constants';

export const CreateRide: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const formState = useAppSelector((state) => state.addRide);
  const { clubId: activeClubId } = useActiveClub();

  const [clubMembers, setClubMembers] = useState<any[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [isUploadingGpx, setIsUploadingGpx] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const toastRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch Club Members for Step 3 (Leaders and Support)
  useEffect(() => {
    if (activeClubId) {
      setIsLoadingMembers(true);
      backendApi.get('/user/club/members', { params: { clubId: Number(activeClubId) } })
        .then((res) => {
          const membersList = res.data?.response || res.data?.data || res.data || [];
          setClubMembers(membersList);
        })
        .catch((err) => {
          console.error("Failed to load club members", err);
        })
        .finally(() => {
          setIsLoadingMembers(false);
        });
    }
  }, [activeClubId]);

  // GSAP animated success toast controller
  useEffect(() => {
    if (showSuccessToast && toastRef.current) {
      gsap.fromTo(toastRef.current,
        { opacity: 0, scale: 0.8, y: -50 },
        { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: "back.out(1.7)" }
      );
      const timer = setTimeout(() => {
        gsap.to(toastRef.current, {
          opacity: 0,
          scale: 0.8,
          y: -50,
          duration: 0.4,
          onComplete: () => {
            setShowSuccessToast(false);
            dispatch(resetRideForm());
            navigate(ROUTES.ACTIVITIES);
          }
        });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showSuccessToast, navigate, dispatch]);

  // Close dropdown when clicking outside
  const dropdownRef = useRef<HTMLDivElement>(null);
  const handleDocumentClick = useCallback((e: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
      setOpenDropdown(null);
    }
  }, []);
  useEffect(() => {
    if (openDropdown) {
      document.addEventListener('mousedown', handleDocumentClick);
    }
    return () => document.removeEventListener('mousedown', handleDocumentClick);
  }, [openDropdown, handleDocumentClick]);

  const toggleDropdown = (field: string | null) => {
    setOpenDropdown(openDropdown === field ? null : field);
  };

  // GPX File Upload Handler
  const handleGpxUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.gpx')) {
      toast.error('Only .gpx files are accepted.');
      return;
    }

    setIsUploadingGpx(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await backendApi.post('/user/upload/file', formData);
      const uploadRes = response.data?.response || response.data;
      const fileName = uploadRes?.fileName || uploadRes?.data?.fileName;
      if (fileName) {
        dispatch(updateStepFields({ gpxFile: fileName }));
        toast.success('GPX route uploaded successfully.');
      } else {
        toast.error('Failed to parse uploaded file name.');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err.message || 'GPX file upload failed.');
    } finally {
      setIsUploadingGpx(false);
    }
  };

  // Field validations
  const validateStep = (stepNum: number) => {
    const newErrors: Record<string, string> = {};
    if (stepNum === 1) {
      if (!formState.rideName.trim()) newErrors.rideName = "Ride name is required";
      if (!formState.date) newErrors.date = "Date is required";
      if (!formState.time) newErrors.time = "Time is required";
      if (!formState.meetingPoint.trim()) newErrors.meetingPoint = "Meeting point is required";
      if (!formState.distance || formState.distance <= 0) newErrors.distance = "Valid distance is required";
      if (!formState.gpxFile) newErrors.gpxFile = "GPX Route file is required";
    } else if (stepNum === 2) {
      if (!formState.pace) newErrors.pace = "Pace selection is required";
      if (formState.isRecurringActivity) {
        if (formState.recurringActivities.length === 0) {
          newErrors.recurringActivities = "Please select at least one day for recurrence";
        }
        if (!formState.expiryDate) {
          newErrors.expiryDate = "Expiry date is required for recurring rides";
        }
      }
    } else if (stepNum === 3) {
      if (formState.rideLeaders.length === 0) {
        newErrors.rideLeaders = "Please assign at least one ride leader";
      }
      if (formState.isPaymentRequired && (!formState.price || Number(formState.price) <= 0)) {
        newErrors.price = "Price is required and must be greater than 0 when payment is required";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(formState.currentStep)) {
      dispatch(setStep(formState.currentStep + 1));
    } else {
      toast.error("Please fill in all required fields correctly.");
    }
  };

  const handlePrev = () => {
    dispatch(setStep(formState.currentStep - 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) {
      toast.error("Please fill in all required fields correctly.");
      return;
    }

    if (!activeClubId) {
      toast.error("No active club selected. Please select or create a club first.");
      return;
    }

    setIsSubmitting(true);
    try {
      const cleanedLeaders = (formState.rideLeaders || [])
        .map((l: any) => ({
          userId: Number(l.userId || l.id),
          name: String(l.name || l.fullName || 'Leader'),
        }))
        .filter((l: any) => Boolean(l.userId) && !isNaN(l.userId));

      const payload: any = {
        clubId: Number(activeClubId),
        clubIds: [Number(activeClubId)],
        rideName: formState.rideName.trim(),
        date: formState.date,
        time: formState.time.length === 5 ? `${formState.time}:00` : formState.time,
        activityTypeId: Number(formState.activityTypeId || 1),
        categoryTypeId: Number(formState.categoryTypeId || 1),
        meetingPoint: formState.meetingPoint.trim(),
        gpxFile: formState.gpxFile || '',
        distance: Number(formState.distance || 0),
        description: formState.description.trim(),
        pace: formState.pace || 'Moderate',
        isRecurringActivity: Boolean(formState.isRecurringActivity),
        isStops: Boolean(formState.isStops),
        isRecommendedSlots: Boolean(formState.isRecommendedSlots),
        isWomenAndNonBinary: Boolean(formState.isWomenAndNonBinary),
        rideLeaders: cleanedLeaders,
        isPublic: Boolean(formState.isPublic),
        isPaymentRequired: Boolean(formState.isPaymentRequired),
      };

      // Set sportSubTypeId (1 for Asphalt, 2 for Trail or existing sportSubTypeId)
      if (formState.isTrail) {
        payload.sportSubTypeId = 2;
      } else if (formState.isAsphalt) {
        payload.sportSubTypeId = 1;
      } else if (formState.sportSubTypeId) {
        payload.sportSubTypeId = Number(formState.sportSubTypeId);
      }

      if (formState.isPaymentRequired) {
        payload.price = Number(formState.price || 0);
      }
      if (formState.isRecurringActivity && formState.recurringActivities?.length) {
        payload.recurringActivities = formState.recurringActivities;
      }
      if (formState.isRecurringActivity && formState.expiryDate) {
        payload.expiryDate = formState.expiryDate;
      }
      if (formState.isStops && formState.stops?.length) {
        payload.stops = formState.stops;
      }
      if (formState.isRecommendedSlots && formState.recommendedSlots?.length) {
        payload.recommendedSlots = formState.recommendedSlots;
      }
      if (formState.supportCarDriver) {
        const driverObj = formState.supportCarDriver as any;
        const driverId = Number(driverObj.userId || driverObj.id || 0);
        const driverName = String(driverObj.name || driverObj.fullName || '');
        if (driverName) {
          payload.supportCarDriver = driverId ? { userId: driverId, name: driverName } : { name: driverName };
        }
      }

      const response = await backendApi.post('/user/ride', payload);
      if (response.status === 200 || response.status === 201) {
        setShowSuccessToast(true);
      } else {
        toast.error("Failed to host the ride.");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err.message || "Failed to host the ride.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Sports matching mobile app and backend
  const sportsOptions = [
    { id: 2, name: 'Running', hasDiscipline: true },
    { id: 1, name: 'Cycling', hasDiscipline: true },
    { id: 4, name: 'Swimming', hasDiscipline: false },
    { id: 5, name: 'Social', hasDiscipline: false },
  ];

  // Activity Types matching mobile app and backend category types
  const activityTypeOptions = [
    { id: 1, name: 'Social' },
    { id: 2, name: 'Training' },
    { id: 3, name: 'Competition' },
  ];

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const slotsOptions = ['Morning', 'Afternoon', 'Evening', 'Night'];

  const selectedSport = sportsOptions.find(s => s.id === formState.activityTypeId) || sportsOptions[0];

  return (
    <div className="p-10 min-h-screen text-text-main bg-main-bg relative overflow-hidden font-sans">
      {/* GSAP Success Toast Overlay */}
      {showSuccessToast && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center backdrop-blur-sm">
          <div 
            ref={toastRef} 
            className="bg-surface border border-[#EB712B]/30 rounded-[32px] p-8 max-w-md text-center shadow-[0_0_40px_rgba(235,113,43,0.2)] space-y-4"
          >
            <CheckCircle2 size={64} className="text-[#EB712B] mx-auto animate-pulse" />
            <h3 className="text-2xl font-black text-white">Ride Created!</h3>
            <p className="text-sm text-text-muted">
              Your ride <strong>{formState.rideName}</strong> was published successfully. Redirecting you to activities...
            </p>
          </div>
        </div>
      )}

      {/* Back button */}
      <button 
        onClick={() => navigate(ROUTES.ACTIVITIES)} 
        className="flex items-center gap-2 text-text-muted hover:text-[#EB712B] transition-colors mb-6 text-sm font-bold uppercase tracking-widest bg-transparent border-0 outline-none cursor-pointer"
      >
        <ArrowLeft size={20} /> Back to Activities
      </button>

      <div className="max-w-4xl mx-auto space-y-8" ref={dropdownRef}>
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-white">Add Ride</h1>
            <p className="text-text-muted text-xs md:text-sm mt-1">Create a new group ride activity and sync with your club members.</p>
          </div>

          {/* Stepper Progress bar */}
          <div className="flex items-center gap-3">
            {[1, 2, 3].map((stepNum) => (
              <div key={stepNum} className="flex items-center gap-2">
                <div 
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 border
                    ${formState.currentStep === stepNum 
                      ? 'bg-[#EB712B] text-white border-[#EB712B] shadow-[0_0_12px_rgba(235,113,43,0.4)]' 
                      : formState.currentStep > stepNum 
                        ? 'bg-[#EB712B]/20 text-[#EB712B] border-[#EB712B]/30' 
                        : 'bg-surface text-text-muted border-border'
                    }
                  `}
                >
                  {stepNum}
                </div>
                {stepNum < 3 && <div className="w-8 h-[2px] bg-border" />}
              </div>
            ))}
          </div>
        </div>

        {/* Wizard Step Forms */}
        <div className="bg-surface border border-border rounded-[32px] p-6 md:p-10 shadow-2xl">
          {/* STEP 1 */}
          {formState.currentStep === 1 && (
            <div className="space-y-6 animate-fade-in">
              {/* Ride Name */}
              <div className="space-y-2">
                <label className="text-text-muted text-xs font-semibold block">Ride Name</label>
                <input 
                  type="text" 
                  value={formState.rideName}
                  onChange={(e) => {
                    dispatch(updateStepFields({ rideName: e.target.value }));
                    if (e.target.value.trim()) setErrors(prev => ({ ...prev, rideName: '' }));
                  }}
                  className={`w-full h-13 bg-[#1e1e1e] border ${errors.rideName ? 'border-red-500' : 'border-border/60'} rounded-xl px-4 text-sm outline-none focus:border-[#EB712B] transition-all text-white placeholder:text-text-muted/40`}
                  placeholder=""
                />
                {errors.rideName && <p className="text-red-500 text-xs">{errors.rideName}</p>}
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-text-muted text-xs font-semibold block">Date</label>
                  <div className="relative">
                    <input 
                      type="date" 
                      min={new Date().toISOString().split('T')[0]}
                      value={formState.date || ''}
                      onChange={(e) => {
                        dispatch(updateStepFields({ date: e.target.value }));
                        setErrors((prev) => ({ ...prev, date: '' }));
                      }}
                      className={`w-full h-13 bg-[#1e1e1e] border ${errors.date ? 'border-red-500' : 'border-border/60'} rounded-xl px-4 text-sm outline-none focus:border-[#EB712B] transition-all text-white cursor-pointer`}
                    />
                  </div>
                  {errors.date && <p className="text-red-500 text-xs">{errors.date}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-text-muted text-xs font-semibold block">Time</label>
                  <input 
                    type="time" 
                    value={formState.time}
                    onChange={(e) => {
                      dispatch(updateStepFields({ time: e.target.value }));
                      if (e.target.value) setErrors(prev => ({ ...prev, time: '' }));
                    }}
                    className={`w-full h-13 bg-[#1e1e1e] border ${errors.time ? 'border-red-500' : 'border-border/60'} rounded-xl px-4 text-sm outline-none focus:border-[#EB712B] transition-all text-white`}
                  />
                  {errors.time && <p className="text-red-500 text-xs">{errors.time}</p>}
                </div>
              </div>

              {/* Sports Dropdown */}
              <div className="space-y-2 relative">
                <label className="text-text-muted text-xs font-semibold block">Sports</label>
                <button
                  type="button"
                  onClick={() => toggleDropdown('sports')}
                  className="w-full h-13 bg-[#1e1e1e] border border-border/60 rounded-xl px-4 text-sm outline-none focus:border-[#EB712B] transition-all text-white flex items-center justify-between cursor-pointer"
                >
                  <span>{selectedSport.name}</span>
                  <ChevronDown size={18} className={`text-text-muted transition-transform ${openDropdown === 'sports' ? 'rotate-180 text-[#EB712B]' : ''}`} />
                </button>
                {openDropdown === 'sports' && (
                  <div className="absolute left-0 w-full bg-[#242424] border border-border rounded-xl shadow-2xl overflow-hidden mt-1 z-30 divide-y divide-border/40">
                    {sportsOptions.map((item) => (
                      <div
                        key={item.id}
                        className={`p-3.5 hover:bg-[#2e2e2e] cursor-pointer text-sm transition-colors flex items-center justify-between ${formState.activityTypeId === item.id ? 'text-[#EB712B] font-bold bg-[#2a2a2a]' : 'text-white'}`}
                        onClick={() => { 
                          dispatch(updateStepFields({ activityTypeId: item.id })); 
                          toggleDropdown(null); 
                        }}
                      >
                        <span>{item.name}</span>
                        {formState.activityTypeId === item.id && <CheckCircle2 size={16} className="text-[#EB712B]" />}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Sport Discipline (Shown when Sport has disciplines like Running or Cycling) */}
              {selectedSport.hasDiscipline && (
                <div className="space-y-2.5">
                  <label className="text-text-muted text-xs font-semibold block">Sport Discipline</label>
                  <div className="flex items-center gap-6">
                    <label 
                      className="flex items-center gap-2.5 cursor-pointer select-none"
                      onClick={() => dispatch(updateStepFields({ isAsphalt: true, isTrail: false, sportSubTypeId: 1 }))}
                    >
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${formState.isAsphalt ? 'border-[#EB712B]' : 'border-border'}`}>
                        {formState.isAsphalt && <div className="w-2.5 h-2.5 rounded-full bg-[#EB712B]" />}
                      </div>
                      <span className={`text-sm ${formState.isAsphalt ? 'text-white font-medium' : 'text-text-muted'}`}>Asphalt</span>
                    </label>

                    <label 
                      className="flex items-center gap-2.5 cursor-pointer select-none"
                      onClick={() => dispatch(updateStepFields({ isAsphalt: false, isTrail: true, sportSubTypeId: 2 }))}
                    >
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${formState.isTrail ? 'border-[#EB712B]' : 'border-border'}`}>
                        {formState.isTrail && <div className="w-2.5 h-2.5 rounded-full bg-[#EB712B]" />}
                      </div>
                      <span className={`text-sm ${formState.isTrail ? 'text-white font-medium' : 'text-text-muted'}`}>Trail</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Activity Type Dropdown */}
              <div className="space-y-2 relative">
                <label className="text-text-muted text-xs font-semibold block">Activity Type</label>
                <button
                  type="button"
                  onClick={() => toggleDropdown('activityType')}
                  className="w-full h-13 bg-[#1e1e1e] border border-border/60 rounded-xl px-4 text-sm outline-none focus:border-[#EB712B] transition-all text-white flex items-center justify-between cursor-pointer"
                >
                  <span>{activityTypeOptions.find(t => t.id === formState.categoryTypeId)?.name || 'Social'}</span>
                  <ChevronDown size={18} className={`text-text-muted transition-transform ${openDropdown === 'activityType' ? 'rotate-180 text-[#EB712B]' : ''}`} />
                </button>
                {openDropdown === 'activityType' && (
                  <div className="absolute left-0 w-full bg-[#242424] border border-border rounded-xl shadow-2xl overflow-hidden mt-1 z-30 divide-y divide-border/40">
                    {activityTypeOptions.map((item) => (
                      <div
                        key={item.id}
                        className={`p-3.5 hover:bg-[#2e2e2e] cursor-pointer text-sm transition-colors flex items-center justify-between ${formState.categoryTypeId === item.id ? 'text-[#EB712B] font-bold bg-[#2a2a2a]' : 'text-white'}`}
                        onClick={() => { 
                          dispatch(updateStepFields({ categoryTypeId: item.id })); 
                          toggleDropdown(null); 
                        }}
                      >
                        <span>{item.name}</span>
                        {formState.categoryTypeId === item.id && <CheckCircle2 size={16} className="text-[#EB712B]" />}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Upload GPX File */}
              <div className="space-y-2">
                <label className="text-text-muted text-xs font-semibold block">Upload GPX File</label>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleGpxUpload}
                  accept=".gpx"
                  className="hidden"
                />

                {formState.gpxFile ? (
                  <div className="flex items-center justify-between bg-[#1e1e1e] border border-[#EB712B]/40 rounded-2xl p-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-[#EB712B]/20 flex items-center justify-center text-[#EB712B] shrink-0">
                        <FileCode size={20} />
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs text-white truncate font-medium block">
                          {formState.gpxFile}
                        </span>
                        <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                          <CheckCircle2 size={10} /> GPX Attached
                        </span>
                      </div>
                    </div>
                    <button 
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-[#EB712B] text-xs font-bold uppercase hover:underline cursor-pointer border-0 outline-none bg-transparent shrink-0"
                    >
                      Change File
                    </button>
                  </div>
                ) : (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={`border border-dashed ${errors.gpxFile ? 'border-red-500' : 'border-[#EB712B]/50 hover:border-[#EB712B]'} rounded-2xl p-6 text-center bg-[#1e1e1e] cursor-pointer hover:bg-[#252525] transition-all flex flex-col items-center justify-center gap-2`}
                  >
                    {isUploadingGpx ? (
                      <>
                        <Loader2 className="animate-spin text-[#EB712B]" size={28} />
                        <span className="text-xs text-text-muted">Uploading route file...</span>
                      </>
                    ) : (
                      <>
                        <div className="w-12 h-12 rounded-2xl bg-[#EB712B]/10 border border-[#EB712B]/20 flex items-center justify-center text-[#EB712B]">
                          <FileCode size={24} />
                        </div>
                        <p className="text-sm font-medium text-white">Click to upload GPX file</p>
                        <p className="text-xs text-text-muted">.gpx file</p>
                      </>
                    )}
                  </div>
                )}
                {errors.gpxFile && <p className="text-red-500 text-xs">{errors.gpxFile}</p>}
              </div>

              {/* Meeting Point */}
              <div className="space-y-2">
                <label className="text-text-muted text-xs font-semibold block">Meeting Point</label>
                <div className="relative flex items-center">
                  <div className="absolute left-4 text-[#EB712B] pointer-events-none">
                    <MapPin size={18} />
                  </div>
                  <input 
                    type="text" 
                    value={formState.meetingPoint}
                    onChange={(e) => {
                      dispatch(updateStepFields({ meetingPoint: e.target.value }));
                      if (e.target.value.trim()) setErrors(prev => ({ ...prev, meetingPoint: '' }));
                    }}
                    className={`w-full h-13 bg-[#1e1e1e] border ${errors.meetingPoint ? 'border-red-500' : 'border-border/60'} rounded-xl pl-11 pr-11 text-sm outline-none focus:border-[#EB712B] transition-all text-white placeholder:text-text-muted/40`}
                    placeholder=""
                  />
                  <div className="absolute right-4 text-[#EB712B] pointer-events-none">
                    <Map size={18} />
                  </div>
                </div>
                {errors.meetingPoint && <p className="text-red-500 text-xs">{errors.meetingPoint}</p>}
              </div>

              {/* Ending Point (Optional) */}
              <div className="space-y-2">
                <label className="text-text-muted text-xs font-semibold block">Ending Point (Optional)</label>
                <div className="relative flex items-center">
                  <div className="absolute left-4 text-[#EB712B] pointer-events-none">
                    <MapPin size={18} />
                  </div>
                  <input 
                    type="text" 
                    value={formState.endingPoint || ''}
                    onChange={(e) => dispatch(updateStepFields({ endingPoint: e.target.value }))}
                    className="w-full h-13 bg-[#1e1e1e] border border-border/60 rounded-xl pl-11 pr-11 text-sm outline-none focus:border-[#EB712B] transition-all text-white placeholder:text-text-muted/40"
                    placeholder=""
                  />
                  <div className="absolute right-4 text-[#EB712B] pointer-events-none">
                    <Map size={18} />
                  </div>
                </div>
              </div>

              {/* Distance */}
              <div className="space-y-2">
                <label className="text-text-muted text-xs font-semibold block">Distance (km)</label>
                <input 
                  type="number" 
                  value={formState.distance || ''}
                  onChange={(e) => {
                    dispatch(updateStepFields({ distance: Number(e.target.value) }));
                    if (Number(e.target.value) > 0) setErrors(prev => ({ ...prev, distance: '' }));
                  }}
                  className={`w-full h-13 bg-[#1e1e1e] border ${errors.distance ? 'border-red-500' : 'border-border/60'} rounded-xl px-4 text-sm outline-none focus:border-[#EB712B] transition-all text-white placeholder:text-text-muted/40`}
                  placeholder=""
                />
                {errors.distance && <p className="text-red-500 text-xs">{errors.distance}</p>}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-text-muted text-xs font-semibold block">Description</label>
                <textarea 
                  value={formState.description}
                  onChange={(e) => dispatch(updateStepFields({ description: e.target.value }))}
                  className="w-full bg-[#1e1e1e] border border-border/60 rounded-xl p-4 text-sm outline-none focus:border-[#EB712B] transition-all text-white h-28 resize-none placeholder:text-text-muted/40"
                  placeholder=""
                />
              </div>

              {/* Next Button */}
              <button 
                type="button"
                onClick={handleNext}
                className="w-full h-14 mt-6 rounded-2xl bg-[#EB712B] hover:bg-[#ff8243] text-white font-bold text-base transition-all cursor-pointer border-0 outline-none flex items-center justify-center shadow-lg shadow-[#EB712B]/20"
              >
                Next
              </button>
            </div>
          )}

          {/* STEP 2 */}
          {formState.currentStep === 2 && (
            <div className="space-y-8 animate-fade-in">
              <div className="border-b border-border pb-4">
                <h3 className="text-lg font-bold text-white uppercase tracking-wider">Step 2: Pace, Recurrence & Stops</h3>
                <p className="text-xs text-text-muted">Specify riding speed target, recurrence configurations, and rest stops.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Pace Selection Dropdown */}
                <div className="space-y-2 relative">
                  <label className="text-text-muted text-[10px] font-black uppercase tracking-[0.2em] block">Expected Pace</label>
                  <button
                    type="button"
                    onClick={() => toggleDropdown('pace')}
                    className="w-full h-14 bg-main-bg border border-border rounded-2xl px-5 text-sm outline-none focus:border-[#EB712B] transition-all text-text-main flex items-center justify-between cursor-pointer"
                  >
                    <span>{formState.pace}</span>
                    <ChevronDown size={18} className="text-text-muted" />
                  </button>
                  {openDropdown === 'pace' && (
                    <div className="absolute left-0 w-full bg-main-bg border border-border rounded-2xl shadow-2xl overflow-hidden mt-1 z-30">
                      {['Relaxed', 'Medium', 'Fast'].map((item) => (
                        <div
                          key={item}
                          className="p-4 hover:bg-hover cursor-pointer text-text-main text-sm transition-colors border-b border-border last:border-0"
                          onClick={() => { dispatch(updateStepFields({ pace: item })); toggleDropdown(null); }}
                        >
                          {item}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Elevation Gain */}
                <div className="space-y-2">
                  <label className="text-text-muted text-[10px] font-black uppercase tracking-[0.2em] block">Elevation Gain (meters)</label>
                  <input 
                    type="number" 
                    value={formState.elevationGain || ''}
                    onChange={(e) => dispatch(updateStepFields({ elevationGain: Number(e.target.value) }))}
                    className="w-full h-14 bg-main-bg border border-border rounded-2xl px-5 text-sm outline-none focus:border-[#EB712B] transition-all text-text-main"
                    placeholder="e.g. 500"
                  />
                </div>

                {/* Recurring Activity Toggle */}
                <div className="space-y-3 md:col-span-2 bg-main-bg p-6 rounded-2xl border border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white">Is this a Recurring Ride?</h4>
                      <p className="text-xs text-text-muted">Enable to repeat this ride on selected days of the week.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => dispatch(updateStepFields({ isRecurringActivity: !formState.isRecurringActivity }))}
                      className={`w-14 h-8 rounded-full transition-colors flex items-center p-1 border border-border cursor-pointer
                        ${formState.isRecurringActivity ? 'bg-[#EB712B]' : 'bg-[#222]'}
                      `}
                    >
                      <div className={`w-6 h-6 rounded-full bg-white transition-transform ${formState.isRecurringActivity ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                  </div>

                  {formState.isRecurringActivity && (
                    <div className="pt-4 border-t border-border space-y-4">
                      <label className="text-text-muted text-[10px] font-black uppercase tracking-[0.2em] block">Select Recurrence Days</label>
                      <div className="flex flex-wrap gap-2">
                        {daysOfWeek.map((day) => {
                          const isSelected = formState.recurringActivities.includes(day);
                          return (
                            <button
                              key={day}
                              type="button"
                              onClick={() => {
                                const newDays = isSelected
                                  ? formState.recurringActivities.filter(d => d !== day)
                                  : [...formState.recurringActivities, day];
                                dispatch(updateStepFields({ recurringActivities: newDays }));
                                if (newDays.length > 0) {
                                  setErrors((prev) => ({ ...prev, recurringActivities: '' }));
                                }
                              }}
                              className={`px-4 py-2.5 rounded-full text-xs font-bold transition-all border outline-none cursor-pointer select-none
                                ${isSelected 
                                  ? 'bg-[#EB712B] text-white border-[#EB712B] shadow-md shadow-[#EB712B]/20' 
                                  : 'bg-surface text-text-muted border-border hover:border-[#EB712B]/40 hover:text-text-main'
                                }
                              `}
                            >
                              {day}
                            </button>
                          );
                        })}
                      </div>
                      {errors.recurringActivities && <p className="text-red-500 text-xs">{errors.recurringActivities}</p>}
                      <div className="pt-2 space-y-2">
                        <label className="text-text-muted text-[10px] font-black uppercase tracking-[0.2em] block">Expiry Date</label>
                        <div className="relative">
                          <input 
                            type="date"
                            min={formState.date || new Date().toISOString().split('T')[0]}
                            value={formState.expiryDate || ''}
                            onChange={(e) => {
                              dispatch(updateStepFields({ expiryDate: e.target.value }));
                              setErrors((prev) => ({ ...prev, expiryDate: '' }));
                            }}
                            className={`w-full h-14 bg-main-bg border ${errors.expiryDate ? 'border-red-500' : 'border-border'} rounded-2xl px-5 text-sm outline-none focus:border-[#EB712B] transition-all text-text-main cursor-pointer appearance-none`}
                          />
                          <Calendar 
                            className="absolute right-5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" 
                            size={18} 
                          />
                        </div>
                        {errors.expiryDate && <p className="text-red-500 text-xs mt-1">{errors.expiryDate}</p>}
                      </div>
                    </div>
                  )}
                </div>

                {/* Rest Stops Toggle */}
                <div className="space-y-3 md:col-span-2 bg-main-bg p-6 rounded-2xl border border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white">Stops Configurations</h4>
                      <p className="text-xs text-text-muted">Mark whether this ride has scheduled rest or checkpoint stops.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => dispatch(updateStepFields({ isStops: !formState.isStops }))}
                      className={`w-14 h-8 rounded-full transition-colors flex items-center p-1 border border-border cursor-pointer
                        ${formState.isStops ? 'bg-[#EB712B]' : 'bg-[#222]'}
                      `}
                    >
                      <div className={`w-6 h-6 rounded-full bg-white transition-transform ${formState.isStops ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                  </div>

                  {formState.isStops && (
                    <div className="pt-4 border-t border-border space-y-4">
                      <label className="text-text-muted text-[10px] font-black uppercase tracking-[0.2em] block">Specify Rest Stop Coordinates / Km Markers (e.g. 15, 30)</label>
                      <input 
                        type="text"
                        value={formState.stops.join(', ')}
                        onChange={(e) => {
                          const parsed = e.target.value.split(',')
                            .map(n => Number(n.trim()))
                            .filter(n => !isNaN(n) && n > 0);
                          dispatch(updateStepFields({ stops: parsed }));
                        }}
                        className="w-full h-14 bg-main-bg border border-border rounded-2xl px-5 text-sm outline-none focus:border-[#EB712B] transition-all text-text-main"
                        placeholder="e.g. 15, 30"
                      />
                    </div>
                  )}
                </div>

                {/* Recommended Slots Toggle */}
                <div className="space-y-3 md:col-span-2 bg-main-bg p-6 rounded-2xl border border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white">Specify Recommended Slots</h4>
                      <p className="text-xs text-text-muted">Recommend preferred parts of the day for cyclists participating in this ride.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => dispatch(updateStepFields({ isRecommendedSlots: !formState.isRecommendedSlots }))}
                      className={`w-14 h-8 rounded-full transition-colors flex items-center p-1 border border-border cursor-pointer
                        ${formState.isRecommendedSlots ? 'bg-[#EB712B]' : 'bg-[#222]'}
                      `}
                    >
                      <div className={`w-6 h-6 rounded-full bg-white transition-transform ${formState.isRecommendedSlots ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                  </div>

                  {formState.isRecommendedSlots && (
                    <div className="pt-4 border-t border-border space-y-4">
                      <label className="text-text-muted text-[10px] font-black uppercase tracking-[0.2em] block">Recommended Time Slots</label>
                      <div className="flex flex-wrap gap-2">
                        {slotsOptions.map((slot) => {
                          const isSelected = formState.recommendedSlots.includes(slot);
                          return (
                            <button
                              key={slot}
                              type="button"
                              onClick={() => {
                                const newSlots = isSelected
                                  ? formState.recommendedSlots.filter(s => s !== slot)
                                  : [...formState.recommendedSlots, slot];
                                dispatch(updateStepFields({ recommendedSlots: newSlots }));
                              }}
                              className={`px-4 py-2.5 rounded-full text-xs font-bold transition-all border outline-none cursor-pointer
                                ${isSelected 
                                  ? 'bg-[#EB712B] text-white border-[#EB712B]' 
                                  : 'bg-surface text-text-muted border-border hover:text-text-main'
                                }
                              `}
                            >
                              {slot}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Navigation buttons */}
              <div className="grid grid-cols-2 gap-4 mt-8">
                <button 
                  type="button"
                  onClick={handlePrev}
                  className="h-16 rounded-2xl bg-surface border border-border hover:bg-hover text-text-main font-black text-sm uppercase transition-all cursor-pointer outline-none"
                >
                  Previous
                </button>
                <button 
                  type="button"
                  onClick={handleNext}
                  className="h-16 rounded-2xl bg-[#EB712B] hover:bg-[#ff8243] text-white font-black text-sm uppercase transition-all cursor-pointer border-0 outline-none"
                >
                  Next Step
                </button>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {formState.currentStep === 3 && (
            <div className="space-y-8 animate-fade-in">
              <div className="border-b border-border pb-4">
                <h3 className="text-lg font-bold text-white uppercase tracking-wider">Step 3: Access, Leaders & Support</h3>
                <p className="text-xs text-text-muted">Establish ride visibility, assign leaders, and configure support vehicles.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Public Visibility Toggle */}
                <div className="flex items-center justify-between bg-main-bg p-6 rounded-2xl border border-border">
                  <div>
                    <h4 className="text-sm font-bold text-white">Public Visibility</h4>
                    <p className="text-xs text-text-muted">If active, anyone in the community can view and join this ride.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => dispatch(updateStepFields({ isPublic: !formState.isPublic }))}
                    className={`w-14 h-8 rounded-full transition-colors flex items-center p-1 border border-border cursor-pointer
                      ${formState.isPublic ? 'bg-[#EB712B]' : 'bg-[#222]'}
                    `}
                  >
                    <div className={`w-6 h-6 rounded-full bg-white transition-transform ${formState.isPublic ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>

                {/* Women & Non-Binary Focus Toggle */}
                <div className="flex items-center justify-between bg-main-bg p-6 rounded-2xl border border-border">
                  <div>
                    <h4 className="text-sm font-bold text-white">Women and Non-Binary Focus</h4>
                    <p className="text-xs text-text-muted">Mark if this is primarily oriented for women/non-binary cyclists.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => dispatch(updateStepFields({ isWomenAndNonBinary: !formState.isWomenAndNonBinary }))}
                    className={`w-14 h-8 rounded-full transition-colors flex items-center p-1 border border-border cursor-pointer
                      ${formState.isWomenAndNonBinary ? 'bg-[#EB712B]' : 'bg-[#222]'}
                    `}
                  >
                    <div className={`w-6 h-6 rounded-full bg-white transition-transform ${formState.isWomenAndNonBinary ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>

                {/* Payment Required Toggle & Price */}
                <div className="space-y-4 bg-main-bg p-6 rounded-2xl border border-border md:col-span-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white">Registration Payment Required</h4>
                      <p className="text-xs text-text-muted">Enable if participants must complete payments to RSVP to this ride.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const nextVal = !formState.isPaymentRequired;
                        dispatch(updateStepFields({ isPaymentRequired: nextVal }));
                        if (!nextVal) {
                          setErrors((prev) => ({ ...prev, price: '' }));
                        }
                      }}
                      className={`w-14 h-8 rounded-full transition-colors flex items-center p-1 border border-border cursor-pointer
                        ${formState.isPaymentRequired ? 'bg-[#EB712B]' : 'bg-[#222]'}
                      `}
                    >
                      <div className={`w-6 h-6 rounded-full bg-white transition-transform ${formState.isPaymentRequired ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                  </div>

                  {formState.isPaymentRequired && (
                    <div className="pt-4 border-t border-border space-y-2">
                      <label className="text-text-muted text-[10px] font-black uppercase tracking-[0.2em] block">
                        Registration Fee / Price ($ or local currency)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        placeholder="e.g. 15.00"
                        value={formState.price || ''}
                        onChange={(e) => {
                          const val = e.target.value === '' ? 0 : Number(e.target.value);
                          dispatch(updateStepFields({ price: val }));
                          if (val > 0) {
                            setErrors((prev) => ({ ...prev, price: '' }));
                          }
                        }}
                        className={`w-full h-14 bg-surface border ${errors.price ? 'border-red-500' : 'border-border'} rounded-2xl px-5 text-sm outline-none focus:border-[#EB712B] transition-all text-text-main`}
                      />
                      {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
                    </div>
                  )}
                </div>

                {/* Support Car Driver Dropdown */}
                <div className="space-y-2 relative md:col-span-2">
                  <label className="text-text-muted text-[10px] font-black uppercase tracking-[0.2em] block">Support Car Driver</label>
                  <button
                    type="button"
                    onClick={() => toggleDropdown('supportDriver')}
                    className="w-full h-14 bg-main-bg border border-border rounded-2xl px-5 text-sm outline-none focus:border-[#EB712B] transition-all text-text-main flex items-center justify-between cursor-pointer"
                  >
                    <span>
                      {formState.supportCarDriver 
                        ? formState.supportCarDriver.name 
                        : 'Select support driver (Optional)'
                      }
                    </span>
                    <ChevronDown size={18} className="text-text-muted" />
                  </button>
                  {openDropdown === 'supportDriver' && (
                    <div className="absolute left-0 w-full bg-main-bg border border-border rounded-2xl shadow-2xl overflow-hidden mt-1 z-30">
                      <div
                        className="p-4 hover:bg-hover cursor-pointer text-text-muted text-sm transition-colors border-b border-border italic"
                        onClick={() => { dispatch(updateStepFields({ supportCarDriver: null })); toggleDropdown(null); }}
                      >
                        No support car driver
                      </div>
                      {isLoadingMembers ? (
                        <div className="p-4 flex items-center justify-center"><Loader2 size={16} className="animate-spin text-[#EB712B]" /></div>
                      ) : (
                        clubMembers.map((member) => {
                          const mId = Number(member.userId || member.id);
                          const mName = member.fullName || ((member.firstName || '') + ' ' + (member.lastName || '')).trim() || member.username || 'Member';
                          return (
                            <div
                              key={mId}
                              className="p-4 hover:bg-hover cursor-pointer text-text-main text-sm transition-colors border-b border-border last:border-0"
                              onClick={() => {
                                dispatch(updateStepFields({ 
                                  supportCarDriver: { userId: mId, name: mName } 
                                }));
                                toggleDropdown(null);
                              }}
                            >
                              {mName} ({member.email || 'N/A'})
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>

                {/* Ride Leaders Multi-Select */}
                <div className="space-y-4 md:col-span-2">
                  <div>
                    <label className="text-text-muted text-[10px] font-black uppercase tracking-[0.2em] block">Assign Ride Leaders</label>
                    <p className="text-xs text-text-muted mt-1">Assign one or more leaders to manage the group and navigation during the ride.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {isLoadingMembers ? (
                      <div className="col-span-full py-8 flex items-center justify-center"><Loader2 size={24} className="animate-spin text-[#EB712B]" /></div>
                    ) : (
                      clubMembers.map((member) => {
                        const mId = Number(member.userId || member.id);
                        const mName = member.fullName || ((member.firstName || '') + ' ' + (member.lastName || '')).trim() || member.username || 'Member';
                        const isAssigned = formState.rideLeaders.some(leader => Number(leader.userId || (leader as any).id) === mId);
                        return (
                          <button
                            key={mId}
                            type="button"
                            onClick={() => {
                              const newLeaders = isAssigned
                                ? formState.rideLeaders.filter(leader => Number(leader.userId || (leader as any).id) !== mId)
                                : [...formState.rideLeaders, { userId: mId, name: mName }];
                              dispatch(updateStepFields({ rideLeaders: newLeaders }));
                              setErrors(prev => ({ ...prev, rideLeaders: '' }));
                            }}
                            className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all duration-300 outline-none cursor-pointer
                              ${isAssigned 
                                ? 'bg-[#EB712B]/10 border-[#EB712B] text-white shadow-[0_0_12px_rgba(235,113,43,0.15)]' 
                                : 'bg-main-bg border-border text-text-muted hover:text-text-main hover:border-white/10'
                              }
                            `}
                          >
                            <div className="min-w-0 pr-2">
                              <p className="text-sm font-bold truncate">{mName}</p>
                              <p className="text-[10px] text-text-muted truncate mt-0.5">{member.email || 'N/A'}</p>
                            </div>
                            {isAssigned && <CheckCircle2 size={16} className="text-[#EB712B] shrink-0" />}
                          </button>
                        );
                      })
                    )}
                  </div>
                  {errors.rideLeaders && <p className="text-red-500 text-xs">{errors.rideLeaders}</p>}
                </div>
              </div>

              {/* Navigation buttons */}
              <div className="grid grid-cols-2 gap-4 mt-8">
                <button 
                  type="button"
                  onClick={handlePrev}
                  className="h-16 rounded-2xl bg-surface border border-border hover:bg-hover text-text-main font-black text-sm uppercase transition-all cursor-pointer outline-none"
                >
                  Previous
                </button>
                <button 
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="h-16 rounded-2xl bg-[#EB712B] hover:bg-[#ff8243] text-white font-black text-sm uppercase transition-all cursor-pointer border-0 outline-none flex items-center justify-center gap-2"
                >
                  {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                  {isSubmitting ? "Publishing..." : "Publish Ride"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateRide;
