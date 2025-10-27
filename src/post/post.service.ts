import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { Repository } from 'typeorm';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { User, UserRole } from 'src/auth/entities/user.entity';
import { PostResponseDto } from './dto/get-post.dto';

@Injectable()
export class PostService {
  constructor(@InjectRepository(Post) private postRepo: Repository<Post>) {}
  async findAll(): Promise<Post[]> {
    return this.postRepo.find({ relations: ['author'] });
  }
  async findOne(id: number): Promise<Post> {
    const singlePost = await this.postRepo.findOne({
      where: { id },
      relations: ['author'],
    });
    if (!singlePost) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }
    return singlePost;
  }
  async create(
    postData: CreatePostDto,
    author: User,
  ): Promise<PostResponseDto> {
    const newlyCreatedPost = this.postRepo.create({
      title: postData.title,
      content: postData.content,
      author,
    });
    return new PostResponseDto(await this.postRepo.save(newlyCreatedPost));
  }
  async update(id: number, postData: UpdatePostDto, user: User): Promise<Post> {
    // const existingPost = await this.postRepo.findOneBy({ id });
    const existingPost = await this.findOne(id);
    if (!existingPost) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }
    if (existingPost.author.id !== user.id && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException(`You can only update your own posts`);
    }
    if (postData.title) {
      existingPost.title = postData.title;
    }
    if (postData.content) {
      existingPost.content = postData.content;
    }
    return this.postRepo.save(existingPost);
  }
  async remove(id: number): Promise<void> {
    // const deleteResult = await this.postRepo.delete(id);
    // if (deleteResult.affected === 0) {
    //   throw new NotFoundException(`Post with ID ${id} not found`);
    // }
    const findPostToDelete = await this.findOne(id);
    await this.postRepo.remove(findPostToDelete);
  }
}
