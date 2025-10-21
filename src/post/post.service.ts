import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { Repository } from 'typeorm';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostService {
  constructor(@InjectRepository(Post) private postRepo: Repository<Post>) {}
  async findAll(): Promise<Post[]> {
    return this.postRepo.find();
  }
  async findOne(id: number): Promise<Post> {
    const singlePost = await this.postRepo.findOneBy({ id });
    if (!singlePost) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }
    return singlePost;
  }
  async create(postData: CreatePostDto): Promise<Post> {
    const newlyCreatedPost = this.postRepo.create({
      title: postData.title,
      content: postData.content,
      author: postData.author,
    });
    return this.postRepo.save(newlyCreatedPost);
  }
  async update(id: number, postData: UpdatePostDto): Promise<Post> {
    // const existingPost = await this.postRepo.findOneBy({ id });
    const existingPost = await this.findOne(id);
    if (!existingPost) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }
    if (postData.title) {
      existingPost.title = postData.title;
    }
    if (postData.content) {
      existingPost.content = postData.content;
    }
    if (postData.author) {
      existingPost.author = postData.author;
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
