import type { FilterQuery } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../../shared/lib/orm/base.repository';
import type { PaginatedResult, PaginateDto } from '../../shared/modules/pagination';
import type { MembershipRequestsListOptions } from '../dto/membership-requests-list-options.dto';
import { TeamMember } from '../members/team-member.entity';
import { MembershipRequestIssuer } from '../types/membership-request-issuer.enum';
import { TeamMembershipRequest } from '../requests/team-membership-request.entity';

@Injectable()
export class MembershipsService {
  constructor(
    @InjectRepository(TeamMember) private readonly teamMemberRepository: BaseRepository<TeamMember>,
    @InjectRepository(TeamMembershipRequest)
    private readonly teamMembershipRepository: BaseRepository<TeamMembershipRequest>,
  ) {}

  public async findTeamMembership(
    userId: string,
    paginationOptions?: Required<PaginateDto>,
  ): Promise<PaginatedResult<TeamMember>> {
    return await this.teamMemberRepository.findWithPagination(
      paginationOptions,
      { user: { userId } },
      { populate: ['user', 'team'], orderBy: { team: { name: 'ASC' } } },
    );
  }

  public async findAllMembershipRequestsForUser(
    userId: string,
    options?: MembershipRequestsListOptions & Required<PaginateDto>,
  ): Promise<PaginatedResult<TeamMembershipRequest>> {
    let query: FilterQuery<TeamMembershipRequest> = {};

    if (options?.state)
      query = { ...query, state: options.state };
    if (options?.type === 'in')
      query = { ...query, issuer: MembershipRequestIssuer.Team };
    else if (options?.type === 'out')
      query = { ...query, issuer: MembershipRequestIssuer.User };

    return await this.teamMembershipRepository.findWithPagination(
      options,
      { user: { userId }, ...query },
      { orderBy: { createdAt: 'DESC' }, populate: ['team', 'user', 'issuedBy', 'handledBy'] },
    );
  }
}
