import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { PostService } from './post.service';
import { Post as PostEntity } from './entities/post.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { PostExistsPipe } from './pipes/post-exists.pipe';
import { UpdatePostDto } from './dto/update-post.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { currentUser } from 'src/auth/decorators/current-user.decorator';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/auth/entities/user.entity';
import { RolesGuard } from 'src/auth/guards/roles.guard';

@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}
  @Get()
  async findAll(): Promise<PostEntity[]> {
    return this.postService.findAll();
  }
  @Get(':id')
  async findOne(id: number): Promise<PostEntity> {
    return this.postService.findOne(id);
  }
  @UseGuards(JwtAuthGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async create(
    @Body() postData: CreatePostDto,
    @currentUser() user: any,
  ): Promise<PostEntity> {
    return this.postService.create(postData, user);
  }
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe, PostExistsPipe) id: number,
    @Body() postData: UpdatePostDto,
    @currentUser() user: any,
  ): Promise<PostEntity> {
    return this.postService.update(id, postData, user);
  }
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id', ParseIntPipe, PostExistsPipe) id: number,
  ): Promise<void> {
    return this.postService.remove(id);
  }
}
