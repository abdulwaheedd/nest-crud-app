/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreatePostDto {
  @IsNotEmpty({ message: 'Title should not be empty' })
  @IsString({ message: 'Title must be a string' })
  @MinLength(5, { message: 'Title must be at least 5 characters long' })
  @MaxLength(100, { message: 'Title must be at most 100 characters long' })
  title: string;
  @IsNotEmpty({ message: 'Content should not be empty' })
  @IsString({ message: 'Content must be a string' })
  @MinLength(10, { message: 'Content must be at least 10 characters long' })
  @MaxLength(5000, { message: 'Content must be at most 5000 characters long' })
  content: string;
  @IsNotEmpty({ message: 'Author should not be empty' })
  @IsString({ message: 'Author must be a string' })
  @MinLength(3, { message: 'Author must be at least 3 characters long' })
  @MaxLength(50, { message: 'Author must be at most 50 characters long' })
  author: string;
}
