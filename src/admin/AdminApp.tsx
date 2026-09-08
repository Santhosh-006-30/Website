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
      </Route>

      {/* Fallback to admin home */}
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
};
