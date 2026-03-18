# NP-Kanban-Board


Try it out: https://np-kanban-board-fe.vercel.app/


This is a full-stack Kanban board application built with a React frontend and a Node/Express backend, using Supabase as the database and authentication provider.

The board supports four workflow columns (To Do → In Progress → In Review → Done) with drag-and-drop task management, team member assignment, task comments, priority levels, and due dates. Authentication uses Supabase anonymous sessions, so each visitor gets their own isolated board automatically — no sign-up required.