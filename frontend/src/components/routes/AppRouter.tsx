import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import { Providers } from '@components/Providers/Providers';
import { AppShell } from '@components/layout/AppShell';
import HomePage from '@components/pages/HomePage';
import DocsPage from '@components/pages/DocsPage';
import NodesPage from '@components/pages/NodesPage';
import { ExampleFeaturePage } from '@components/features/ExampleFeature';
import { NodeEnrollmentWizardPage } from '@components/features/NodeEnrollmentWizard';
import { Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

function NavButtons() {
  return (
    <>
      <Button component={RouterLink} to="/nodes" size="small" variant="outlined">
        Nodes
      </Button>
      <Button component={RouterLink} to="/nodes/enroll" size="small" variant="contained">
        Enroll
      </Button>
    </>
  );
}

function Layout() {
  return (
    <Providers>
      {() => (
        <AppShell title="Node Control Plane" topRight={<NavButtons />}>
          <Outlet />
        </AppShell>
      )}
    </Providers>
  );
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'docs', element: <DocsPage /> },
      { path: 'example', element: <ExampleFeaturePage /> },
      { path: 'nodes', element: <NodesPage /> },
      { path: 'nodes/enroll', element: <NodeEnrollmentWizardPage /> },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
