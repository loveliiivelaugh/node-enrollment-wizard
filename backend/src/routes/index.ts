import { OpenAPIHono } from '@hono/zod-openapi';
import { exampleRoutes } from './example.routes';
import { nodesRoutes } from './nodes.routes';
import { enrollmentRoutes } from './enrollment.routes';

const routes = new OpenAPIHono();

routes.get('/', (c) => c.json({ name: 'starter-api', status: 'ok' }));
routes.get('/health', (c) => c.json({ status: 'ok' }));
routes.route('/api/v1/example', exampleRoutes);
routes.route('/api/v1/nodes', nodesRoutes);
routes.route('/api/v1/enrollment', enrollmentRoutes);

export { routes };
