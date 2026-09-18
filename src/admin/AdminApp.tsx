import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminRoute } from './AdminRoute';
import { AdminLayout } from './AdminLayout';
import { AdminLogin } from './AdminLogin';
import { AdminDashboard } from './AdminDashboard';
import { EventManager } from './events/EventManager';
import { EventForm } from './events/EventForm';
import { PostManager } from './posts/PostManager';
import { PostForm } from './posts/PostForm';
import { ProjectManager } from './projects/ProjectManager';
import { ProjectForm } from './projects/ProjectForm';
import { GalleryManager } from './gallery/GalleryManager';
import { TeamManager } from './team/TeamManager';
import { TeamMemberForm } from './team/TeamMemberForm';
import { ContentManager } from './content/ContentManager';
import { SettingsManager } from './settings/SettingsManager';
import { ActivityLog } from './activity/ActivityLog';
import { UserManager } from './users/UserManager';
import { ProfilePage } from './profile/ProfilePage';
import { EventPreview } from './preview/EventPreview';
import { PostPreview } from './preview/PostPreview';
import { ProjectPreview } from './preview/ProjectPreview';

export const AdminApp: React.FC = () => {
  return (
    <Routes>
      {/* Public Login Route */}
      <Route path="login" element={<AdminLogin />} />

      {/* Protected Admin Routes */}
      <Route
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<AdminDashboard />} />

        {/* Events CMS */}
        <Route path="events" element={<EventManager />} />
        <Route path="events/new" element={<EventForm />} />
        <Route path="events/:id/edit" element={<EventForm />} />

        {/* Posts CMS */}
        <Route path="posts" element={<PostManager />} />
        <Route path="posts/new" element={<PostForm />} />
        <Route path="posts/:id/edit" element={<PostForm />} />

        {/* Signature Projects CMS */}
        <Route path="projects" element={<ProjectManager />} />
        <Route path="projects/new" element={<ProjectForm />} />
        <Route path="projects/:id/edit" element={<ProjectForm />} />

        {/* Photo Gallery CMS */}
        <Route path="gallery" element={<GalleryManager />} />

        {/* Team & Leadership CMS */}
        <Route path="team" element={<TeamManager />} />
        <Route path="team/new" element={<TeamMemberForm />} />
        <Route path="team/:id/edit" element={<TeamMemberForm />} />

        {/* Website Content Manager */}
        <Route path="content" element={<ContentManager />} />

        {/* Site Settings */}
        <Route path="settings" element={<SettingsManager />} />

        {/* Content Previews */}
        <Route path="preview/event/:id" element={<EventPreview />} />
        <Route path="preview/post/:id" element={<PostPreview />} />
        <Route path="preview/project/:id" element={<ProjectPreview />} />

        {/* Audit & Activity Log (Admin and Super Admin) */}
        <Route
          path="activity"
          element={
            <AdminRoute minRole="admin">
              <ActivityLog />
            </AdminRoute>
          }
        />

        {/* User & Role Governance (Super Admin only) */}
        <Route
          path="users"
          element={
            <AdminRoute minRole="super_admin">
              <UserManager />
            </AdminRoute>
          }
        />

        {/* Admin Personal Profile */}
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      {/* Fallback to admin home */}
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
};
