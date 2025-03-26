import { Analytics } from '@segment/analytics-node';
import { sendCustomer } from './segment-service';
import { getLogger } from '../utils/logger.utils';
import { readConfiguration } from '../utils/config.utils';

jest.mock('@segment/analytics-node');
jest.mock('../utils/logger.utils');
jest.mock('../utils/config.utils');

describe('segment-service', () => {
  const mockIdentify = jest.fn();
  const mockInfo = jest.fn();
  const mockError = jest.fn();
  const mockReadConfiguration = readConfiguration as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    (Analytics as jest.Mock).mockImplementation(() => ({
      identify: mockIdentify,
    }));

    (getLogger as jest.Mock).mockReturnValue({
      info: mockInfo,
      error: mockError,
    });

    mockReadConfiguration.mockReturnValue({
      segmentSourceWriteKey: 'test-write-key',
    });
  });

  describe('sendCustomer', () => {
    it('should send customer data to Segment', async () => {
      const mockCustomer = createMockCustomer({
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        title: 'Mr',
        salutation: 'Mr',
        dateOfBirth: '1990-01-01',
        customerNumber: 'CN123',
        externalId: 'EXT123',
        isEmailVerified: true,
        locale: 'en-US',
      });

      await sendCustomer(mockCustomer);

      expect(mockIdentify).toHaveBeenCalledWith({
        userId: '762a5ae5-e8c8-47c2-8af2-0dd7024d0f7c',
        messageId: '762a5ae5-e8c8-47c2-8af2-0dd7024d0f7c-2',
        timestamp: '2023-02-01T12:00:00.000Z',
        traits: {
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
          title: 'Mr',
          salutation: 'Mr',
          dateOfBirth: '1990-01-01',
          customerNumber: 'CN123',
          externalId: 'EXT123',
          isEmailVerified: true,
          locale: 'en-US',
        },
      });
    });

    it('should handle missing customer properties gracefully', async () => {
      const mockCustomer = createMockCustomer();

      await sendCustomer(mockCustomer);

      expect(mockIdentify).toHaveBeenCalledWith({
        userId: '762a5ae5-e8c8-47c2-8af2-0dd7024d0f7c',
        messageId: '762a5ae5-e8c8-47c2-8af2-0dd7024d0f7c-2',
        timestamp: '2023-02-01T12:00:00.000Z',
        traits: {
          email: 'test@example.com',
          firstName: undefined,
          lastName: undefined,
          title: undefined,
          salutation: undefined,
          dateOfBirth: undefined,
          customerNumber: undefined,
          externalId: undefined,
          isEmailVerified: false,
          locale: undefined,
        },
      });
    });

    // it('should throw an error when Segment API fails', async () => {
    //   // Setup Segment API to fail
    //   const segmentError = new Error('Segment API failure');
    //   mockIdentify.mockRejectedValueOnce(segmentError);

    //   // Prepare test data
    //   const mockCustomer = {
    //     id: 'customer-789',
    //     version: 3,
    //     lastModifiedAt: '2023-03-01T12:00:00.000Z',
    //     email: 'error@example.com',
    //   };

    //   // Call the function and expect it to throw
    //   await expect(sendCustomer(mockCustomer)).rejects.toThrow(segmentError);

    //   // Verify error was logged
    //   expect(mockError).toHaveBeenCalledWith(
    //     'Error sending customer to Segment: Error: Segment API failure'
    //   );
    // });
  });
});

const createMockCustomer = (overrides = {}) => ({
  id: '762a5ae5-e8c8-47c2-8af2-0dd7024d0f7c',
  version: 2,
  lastModifiedAt: '2023-02-01T12:00:00.000Z',
  email: 'test@example.com',
  createdAt: '2023-01-01T12:00:00.000Z',
  addresses: [],
  isEmailVerified: false,
  stores: [],
  authenticationMode: 'password',
  ...overrides,
});
