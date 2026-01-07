import { Models } from "appwrite";
import { LucideIcon } from "lucide-react";

export type INavLink = {
  icon: LucideIcon;
  route: string;
  label: string;
};

export type IUpdateUser = {
  userId: string;
  name: string;
  bio: string;
  imageId: string;
  imageUrl: URL | string;
  file: File[];
};

export type INewPost = {
  userId: string;
  caption: string;
  file: File[];
  tags?: string;
};

export type IUpdatePost = {
  postId: string;
  caption: string;
  imageId: string;
  imageUrl: URL | string;
  file: File[];
  tags?: string;
};

export type IUser = {
  id: string;
  name: string;
  username: string;
  email: string;
  imageUrl: string;
  bio: string;
  is_verified?: boolean;
};

export type INewUser = {
  name: string;
  email: string;
  username: string;
  password: string;
};

export type ISaveDocument = Models.Document & {
  user: IUserDocument;
  post: IPostDocument;
};

export type ILikeDocument = Models.Document & {
  user: IUserDocument;
  post: IPostDocument;
};

export type IPostDocument = Models.Document & {
  creator: IUserDocument;
  caption: string;
  imageUrl: string;
  imageId: string;
  tags: string[];
  likes: ILikeDocument[];
  save: ISaveDocument[];
  comments: ICommentDocument[];
};

export type IUserDocument = Models.Document & {
  name: string;
  username: string;
  email: string;
  imageUrl: string;
  imageId: string;
  bio: string;
  posts: IPostDocument[];
  liked: ILikeDocument[];
  save: ISaveDocument[];
  followers: IUserDocument[] | string[];
  following: IUserDocument[] | string[];
  is_verified?: boolean;
};

export type INewComment = {
  content: string;
  postId: string;
  userId: string;
};

export type ICommentDocument = Models.Document & {
  content: string;
  creator: IUserDocument;
  post: IPostDocument;
};
