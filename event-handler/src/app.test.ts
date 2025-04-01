import request from 'supertest';
import app from './app';
import { createApiRoot } from './client/create.client';
import { Analytics } from '@segment/analytics-node';

jest.mock('./client/create.client');
jest.mock('@segment/analytics-node');

const mockIdentify = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();

  (Analytics as jest.Mock).mockImplementation(() => ({
    identify: mockIdentify,
  }));
});

it('should handle customer ResourceCreated event', async () => {
  const mockGetCustomer = jest.fn().mockResolvedValue({
    body: {
      id: '871ebaf7-736d-4fc4-9782-4c25101df9f7',
      email: 'test@example.com',
    },
  });
  (createApiRoot as jest.Mock).mockReturnValue({
    customers: () => ({
      withId: () => ({ get: () => ({ execute: mockGetCustomer }) }),
    }),
  });

  await request(app)
    .post('/')
    .send({
      message: {
        data: Buffer.from(
          JSON.stringify({
            resource: {
              typeId: 'customer',
              id: '871ebaf7-736d-4fc4-9782-4c25101df9f7',
            },
            version: 1,
            notificationType: 'ResourceCreated',
          })
        ).toString('base64'),
      },
    })
    .expect(204);

  expect(mockIdentify).toHaveBeenCalled();
});

// it('should handle order ResourceCreated event', async () => {
//   const mockGetOrder = jest.fn().mockResolvedValue({
//     body: { id: 'order-id-789', customerEmail: 'order@example.com' },
//   });
//   const mockIdentify = jest.fn();
//   const mockTrack = jest.fn();

//   (createApiRoot as jest.Mock).mockReturnValue({
//     orders: () => ({
//       withId: () => ({ get: () => ({ execute: mockGetOrder }) }),
//     }),
//   });

//   (Analytics as jest.Mock).mockImplementation(() => ({
//     identify: mockIdentify,
//     track: mockTrack,
//   }));

//   await request(app)
//     .post('/')
//     .send({
//       message: {
//         data: Buffer.from(
//           JSON.stringify({
//             resource: { typeId: 'order', id: 'order-id-789' },
//             notificationType: 'ResourceCreated',
//           })
//         ).toString('base64'),
//       },
//     })
//     .expect(204);

//   expect(mockGetOrder).toHaveBeenCalled();
//   expect(mockTrack).toHaveBeenCalled();
// });

// it('should ignore unsupported resource types', async () => {
//   await request(app)
//     .post('/')
//     .send({
//       message: {
//         data: Buffer.from(
//           JSON.stringify({
//             resource: { typeId: 'unsupported', id: 'resource-id' },
//             notificationType: 'ResourceCreated',
//           })
//         ).toString('base64'),
//       },
//     })
//     .expect(204);

//   expect(createApiRoot).not.toHaveBeenCalled();
// });

// it('should ignore unsupported notification types', async () => {
//   await request(app)
//     .post('/')
//     .send({
//       message: {
//         data: Buffer.from(
//           JSON.stringify({
//             resource: { typeId: 'customer', id: 'customer-id-123' },
//             notificationType: 'UnsupportedType',
//           })
//         ).toString('base64'),
//       },
//     })
//     .expect(204);

//   expect(createApiRoot).not.toHaveBeenCalled();
// });
