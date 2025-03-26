import { Analytics } from '@segment/analytics-node';
import { sendCustomer } from './segment-service';
import { getLogger } from '../utils/logger.utils';
import { readConfiguration } from '../utils/config.utils';

// Mock dependencies
jest.mock('@segment/analytics-node');
jest.mock('../utils/logger.utils');
jest.mock('../utils/config.utils');

describe('segment-service', () => {
  // Setup mocks
  const mockIdentify = jest.fn();
  const mockInfo = jest.fn();
  const mockError = jest.fn();
  const mockReadConfiguration = readConfiguration as jest.Mock;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Setup the Analytics mock
    (Analytics as jest.Mock).mockImplementation(() => ({
      identify: mockIdentify,
    }));

    // Setup logger mock
    (getLogger as jest.Mock).mockReturnValue({
      info: mockInfo,
      error: mockError,
    });

    // Setup configuration mock
    mockReadConfiguration.mockReturnValue({
      segmentSourceWriteKey: 'test-write-key',
    });
  });

  describe('sendCustomer', () => {
    it('should send customer data to Segment', async () => {
      // Prepare test data
      const mockCustomer = {
        id: 'customer-123',
        version: 1,
        lastModifiedAt: '2023-01-01T12:00:00.000Z',
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
        createdAt: '2023-01-01T10:00:00.000Z',
        addresses: [],
        stores: [],
        authenticationMode: 'password',
      };

      // Call the function
      await sendCustomer(mockCustomer);

      // Verify Analytics was instantiated correctly
      expect(Analytics).toHaveBeenCalledWith({
        writeKey: 'test-write-key',
      });

      // Verify identify was called with correct parameters
      expect(mockIdentify).toHaveBeenCalledWith({
        userId: 'customer-123',
        messageId: 'customer-123-1',
        timestamp: '2023-01-01T12:00:00.000Z',
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

      // Verify logger was called with success message
      expect(mockInfo).toHaveBeenCalledWith(
        'Customer customer-123 sent to Segment successfully'
      );
    });

    it('should handle missing customer properties gracefully', async () => {
      // Prepare minimal customer data
      const mockCustomer = {
        id: 'customer-456',
        version: 2,
        lastModifiedAt: '2023-02-01T12:00:00.000Z',
        email: 'minimal@example.com',
        createdAt: '2023-01-01T12:00:00.000Z',
        addresses: [],
        isEmailVerified: false,
        stores: [],
        authenticationMode: 'password',
      };

      // Call the function
      await sendCustomer(mockCustomer);

      // Verify identify was called with correct parameters
      expect(mockIdentify).toHaveBeenCalledWith({
        userId: 'customer-456',
        messageId: 'customer-456-2',
        timestamp: '2023-02-01T12:00:00.000Z',
        traits: {
          email: 'minimal@example.com',
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
