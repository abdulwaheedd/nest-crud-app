import { Post } from '../entities/post.entity';

export class PostResponseDto {
  id: number;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  author: {
    id: number;
    username: string;
    email: string;
    role: string;
  };

  constructor(post: Post) {
    this.id = post.id;
    this.title = post.title;
    this.content = post.content;
    this.createdAt = post.createdAt;
    this.updatedAt = post.updatedAt;
    this.author = {
      id: post.author.id,
      username: post.author.username,
      email: post.author.email,
      role: post.author.role,
    };
  }
}
