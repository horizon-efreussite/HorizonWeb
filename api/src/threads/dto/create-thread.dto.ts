import { IntersectionType, PickType } from '@nestjs/mapped-types';
import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { CreateOrphanContentDto } from '../../contents/dto/create-orphan-content.dto';
import { ThreadType } from '../../shared/lib/types/thread-type.enum';
import { AssigneesDto } from './assignees.dto';
import { TagsDto } from './tags.dto';

export class CreateThreadDto extends IntersectionType(AssigneesDto, TagsDto, PickType(CreateOrphanContentDto, ['body'])) {
  @Length(15, 100)
  @IsString()
  title: string;

  @IsEnum(ThreadType)
  type: ThreadType;

  @IsOptional()
  @IsBoolean()
  isDraft?: boolean;
}
