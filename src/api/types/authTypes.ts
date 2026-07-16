export type ValidateOtpResponse = {
    statusCode: number;
    message:    string;
    response:   SignupResponseResponse;
}

export type SignupResponseResponse = {
    id:                number;
    email:             string;
    token:             string;
    isAthleteProfile?: number;
}

export type ResendOtpResponse = {
    statusCode: number;
    message:    string;
    response:   ResendOtpResponseResponse;
}

export type ResendOtpResponseResponse = {
    id:    number;
    email: string;
}

export type UpdatePasswordResponse = {
    statusCode: number;
    message:    string;
}

export type LoginResponse = {
    statusCode: number;
    response:   SignupResponseResponse;
}

export type UpsertAthleteProfileResponse = {
    statusCode: number;
    message:    string;
    response:   UpsertAthleteProfileResponseResponse;
}

export type UpsertAthleteProfileResponseResponse = {
    id:               number;
    email:            string;
    isAthleteProfile: boolean;
    profileImage:     string;
    fullName:         string;
    dob:              string;
    genderId:         number;
    country:          string;
    unit:             string;
    phone:            string;
    description:      string;
}

export type GetOtherUserInfoResponse = {
    statusCode: number;
    message:    string;
    response:   UserInfoResponseResponse;
}

export type UserInfoResponseResponse = {
    id:               number;
    email:            string;
    fullName:         string;
    dob:              null | string;
    genderId:         number;
    country:          null | string;
    unit:             null | string;
    phone:            null | string;
    description:      null | string;
    isAthleteProfile: number;
    profileImage:     null | string;
    createdAt:        Date;
    updatedAt:        Date;
    scale?:           string;
    timezone?:        null;
    timeFormat?:      string;
}

export type UploadFileResponse = {
    statusCode: number;
    message:    string;
    response:   UploadFileResponseResponse;
}

export type UploadFileResponseResponse = {
    fileName:     string;
    originalName: string;
    mimeType:     string;
}

export type UpdateScaleUnitSettingsResponse = {
    statusCode: number;
    message:    string;
    response:   UpdateScaleUnitSettingsResponseResponse;
}

export type UpdateScaleUnitSettingsResponseResponse = {
    id:    number;
    scale: string;
}

export type CheckEmailExistenceResponse = {
    statusCode: number;
    message:    string;
    response:   CheckEmailExistenceResponseResponse;
}

export type CheckEmailExistenceResponseResponse = {
    exists: boolean;
}

export type SignupRequest = {
    email:    string;
    password: string;
}

export type LoginRequest = {
    email:    string;
    password: string;
}

export type ForgotPasswordParams = {
    email: string;
}

export type ForgotPasswordResponseResponse = {
    id:    number;
    email: string;
    token: string;
}

export type ResendOtpRequest = {
    email: string;
}

export type ValidateOtpRequest = {
    OTP: number;
}

export type ChangePasswordRequest = {
    password: string;
}

export type UpdatePasswordRequest = {
    password:    string;
    newPassword: string;
}

export type UpsertAthleteProfileRequest = {
    profileImage?: string;
    fullName?:     string;
    dob?:          string;
    genderId?:     number;
    country?:      string;
    unit?:         string;
    phone?:        string;
    description?:  string;
    timezone?:     string;
    timeFormat?:   string;
}

export type FirebaseLoginRequest = {
    idToken: string;
}

export type UpdateFcmTokenRequest = {
    fcmToken: string;
}

export type UpdateScaleUnitSettingsRequest = {
    scale: 'meter' | 'kilometer' | 'miles' | string;
}

export type CheckEmailExistenceParams = {
    email: string;
}

export type GetOtherUserInfoParams = {
    userId: string | number;
}


