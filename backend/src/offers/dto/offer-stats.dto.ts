import { ApiProperty } from '@nestjs/swagger';

export class OfferStatsResponse {
  @ApiProperty({
    description: 'Total number of offers sent by the user',
    example: 15,
  })
  totalSent: number;

  @ApiProperty({
    description: 'Total number of offers received by the user',
    example: 23,
  })
  totalReceived: number;

  @ApiProperty({
    description: 'Number of pending offers sent',
    example: 3,
  })
  pendingSent: number;

  @ApiProperty({
    description: 'Number of pending offers received',
    example: 5,
  })
  pendingReceived: number;

  @ApiProperty({
    description: 'Number of accepted offers',
    example: 8,
  })
  totalAccepted: number;

  @ApiProperty({
    description: 'Number of rejected offers',
    example: 12,
  })
  totalRejected: number;

  @ApiProperty({
    description: 'Success rate as a percentage',
    example: 53.3,
  })
  successRate: number;

  @ApiProperty({
    description: 'Average response time in hours',
    example: 18.5,
  })
  averageResponseTime: number;

  @ApiProperty({
    description: 'Total value of accepted offers in kobo',
    example: 450000000,
  })
  totalValueInKobo: number;

  @ApiProperty({
    description: 'Formatted total value for display',
    example: '₦4,500,000',
  })
  displayTotalValue: string;
}