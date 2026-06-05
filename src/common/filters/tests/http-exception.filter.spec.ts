import { ArgumentsHost, BadRequestException } from '@nestjs/common';
import { AllExceptionsFilter } from '../http-exception.filter';

type MockResponse = {
  status: jest.Mock<MockResponse, [number]>;
  json: jest.Mock<void, [unknown]>;
};

describe('AllExceptionsFilter', () => {
  it('should format HttpException response with details', () => {
    const filter = new AllExceptionsFilter();
    const response: MockResponse = {
      status: jest.fn().mockReturnThis() as unknown as jest.Mock<MockResponse, [number]> ,
      json: jest.fn(),
    };
    const request = { url: '/test' };

    const host: ArgumentsHost = {
      switchToHttp: () => ({
        getResponse: <T>() => response as unknown as T,
        getRequest: <T>() => request as unknown as T,
      }),
    } as ArgumentsHost;

    filter.catch(new BadRequestException(['invalid']), host);

    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: 'Validation failed',
        details: ['invalid'],
        path: '/test',
      }),
    );
  });
});
