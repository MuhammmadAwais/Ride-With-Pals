export type UpdateNewsCommentResponse = {
    statusCode: number;
    message:    string;
    response?:  LatestCommentElement;
}

export type LatestCommentElement = {
    id:         number;
    newsId:     number;
    userId:     number;
    comment:    string;
    updatedAt:  Date;
    createdAt:  Date;
    deletedAt?: null;
    user?:      User;
}

export type User = {
    id:           number;
    fullName:     string;
    profileImage: null;
}

export type GetAllNewsCommentsResponse = {
    statusCode: number;
    message:    string;
    response:   GetAllNewsCommentsResponseResponse;
}

export type GetAllNewsCommentsResponseResponse = {
    count: number;
    rows:  LatestCommentElement[];
}

export type DelCommentResponse = {
    statusCode: number;
    message:    string;
}

export type DeleteNewsResponse = {
    statusCode: number;
    message:    string;
    response?:  AddNewsResponseResponse;
}

export type AddNewsResponseResponse = {
    id:                  number;
    title:               string;
    description:         string;
    image:               string;
    clubId:              number;
    addedBy:             number;
    updatedAt:           Date;
    createdAt:           Date;
    deletedAt?:          Date | null;
    latestComment?:      LatestCommentElement | null;
    totalCommentsCount?: number;
}

export type GetAllNewsResponse = {
    statusCode: number;
    message:    string;
    response:   GetAllNewsResponseResponse;
}

export type GetAllNewsResponseResponse = {
    count: number;
    rows:  AddNewsResponseResponse[];
}

export type AddCommentRequest = {
    newsId:  number;
    comment: string;
}

export type GetAllNewsCommentsParams = {
    newsId:  number | string;
    limit?:  number | string;
    offset?: number | string;
}

export type UpdateNewsCommentRequest = {
    newsId:        number;
    newsCommentId: number;
    comment:       string;
}

export type DelCommentRequest = {
    newsId:        number;
    newsCommentId: number;
}

export type AddNewsRequest = {
    title:        string;
    description:  string;
    image?:       string;
    clubId:       number;
}

export type GetNewsByIdParams = {
    id: number | string;
}

export type UpdateNewsRequest = {
    id:          number;
    title:       string;
    description: string;
    image?:      string;
    clubId:      number;
}

export type DeleteNewsRequest = {
    id: number;
}

export type GetAllNewsParams = {
    clubId: number | string;
}


