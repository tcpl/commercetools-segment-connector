import { Analytics } from '@segment/analytics-node';
import { sendCustomer } from './segment-service';

jest.mock('@segment/analytics-node');
jest.mock('../utils/config.utils');

describe('segment-service', () => {
  const mockIdentify = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (Analytics as jest.Mock).mockImplementation(() => ({
      identify: mockIdentify,
    }));
  });

  describe('sendCustomer', () => {
    it('should send customer data to Segment', async () => {
      const mockCustomer = createMockCustomer({
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        middleName: 'middle',
        title: 'Mr',
        salutation: 'Salutation',
        dateOfBirth: '1990-11-01',
        customerNumber: 'CN123',
        externalId: 'EXT123',
        isEmailVerified: true,
        locale: 'en-US',
      });

      sendCustomer(mockCustomer);

      expect(mockIdentify).toHaveBeenCalledWith({
        userId: '762a5ae5-e8c8-47c2-8af2-0dd7024d0f7c',
        messageId: '762a5ae5-e8c8-47c2-8af2-0dd7024d0f7c-2',
        timestamp: '2023-02-01T12:00:00.000Z',
        traits: {
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
          title: 'Mr',
          salutation: 'Salutation',
          dateOfBirth: '1990-11-01',
          customerNumber: 'CN123',
          externalId: 'EXT123',
          isEmailVerified: true,
          locale: 'en-US',
        },
      });
    });

    it('should handle missing customer properties gracefully', async () => {
      const mockCustomer = createMockCustomer();

      sendCustomer(mockCustomer);

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

    it('should throw an error when Segment API fails', async () => {
      const segmentError = new Error('Segment API failure');

      mockIdentify.mockImplementation(() => {
        throw segmentError;
      });

      const mockCustomer = createMockCustomer();

      expect(() => sendCustomer(mockCustomer)).toThrow(segmentError);
    });
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
  customerGroupAssignments: [],
  password: '****2Zk=',
  authenticationMode: 'password',
  ...overrides,
});
