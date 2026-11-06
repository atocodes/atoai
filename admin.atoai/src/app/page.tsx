"use client";

import React, { useState } from "react";
import { AdminHeader, AdminTab } from "@/components/AdminHeader";
import { useAuth, AdminAuthModal } from "@/features/auth";
import {
  useKnowledge,
  KnowledgeStatsGrid,
  KnowledgeTable,
  DocumentDrawer,
  IngestModal,
} from "@/features/knowledge";
import { VectorPlayground } from "@/features/search";
import { RAGChatStudio } from "@/features/chat";
import {
  useTelegramLogs,
  TelegramLogStatsGrid,
  TelegramLogTable,
  TelegramLogDrawer,
} from "@/features/telegram-logs";
import {
  useSources,
  SourceStatsGrid,
  SourceTable,
  SourceModal,
  SourceDrawer,
} from "@/features/sources";
import { AdminSettingsView } from "@/features/settings";
import { Loader2 } from "lucide-react";

export default function AdminPage() {
  // Feature Hook 1: Authentication
  const {
    user,
    hasAdmin,
    authChecked,
    login,
    setupAdmin,
    logout,
    refresh: refreshAuth,
  } = useAuth();

  // App UI state
  const [activeTab, setActiveTab] = useState<AdminTab>("knowledge");
  const [isIngestOpen, setIsIngestOpen] = useState(false);
  const [inspectingDocId, setInspectingDocId] = useState<string | null>(null);

  // Feature Hook 2: Knowledge Ledger & Telemetry
  const {
    stats,
    statsLoading,
    documents,
    total,
    page,
    limit,
    search,
    selectedType,
    tableLoading,
    setPage,
    setSearch,
    setSelectedType,
    removeDocument,
    removeDocuments,
    ingestDocument,
    refresh: refreshKnowledge,
  } = useKnowledge(!!user);

  // Feature Hook 3: Telegram Ingestion Telemetry & Logs
  const {
    stats: tgStats,
    statsLoading: tgStatsLoading,
    logs: tgLogs,
    total: tgTotal,
    page: tgPage,
    limit: tgLimit,
    statusFilter: tgStatusFilter,
    search: tgSearch,
    tableLoading: tgTableLoading,
    selectedLog: tgSelectedLog,
    setSelectedLog: setTgSelectedLog,
    setPage: setTgPage,
    setStatusFilter: setTgStatusFilter,
    setSearch: setTgSearch,
    removeLog: removeTgLog,
    clearAll: clearAllTgLogs,
    refresh: refreshTgLogs,
  } = useTelegramLogs(!!user);

  // Feature Hook 4: Channels & Sources Management
  const {
    stats: srcStats,
    statsLoading: srcStatsLoading,
    sources,
    total: srcTotal,
    page: srcPage,
    limit: srcLimit,
    statusFilter: srcStatusFilter,
    typeFilter: srcTypeFilter,
    search: srcSearch,
    tableLoading: srcTableLoading,
    selectedSource,
    isModalOpen: isSourceModalOpen,
    editingSource,
    setSelectedSource,
    setIsModalOpen: setIsSourceModalOpen,
    setPage: setSrcPage,
    setStatusFilter: setSrcStatusFilter,
    setTypeFilter: setSrcTypeFilter,
    setSearch: setSrcSearch,
    createSource,
    updateSource,
    toggleStatus: toggleSourceStatus,
    removeSource,
    openCreateModal: openCreateSourceModal,
    openEditModal: openEditSourceModal,
    refresh: refreshSources,
  } = useSources(!!user);

  if (!authChecked) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#141414] font-mono text-xs text-[#A7A49E]">
        <Loader2 className="w-6 h-6 animate-spin text-[#9ECE9B] mr-2" />
        <span>CONNECTING TO ATOAI SERVER...</span>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#141414] text-[#F2F0EA] overflow-hidden font-sans">
      {/* Top Header Navigation */}
      <AdminHeader
        user={user}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenIngest={() => setIsIngestOpen(true)}
        onLogout={logout}
      />

      {/* Main Container - Fills window viewport */}
      <main className="flex-1 min-h-0 w-full max-w-7xl mx-auto p-4 sm:p-6 flex flex-col overflow-hidden">
        {/* Tab 1: Knowledge Ledger */}
        {activeTab === "knowledge" && (
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            <KnowledgeStatsGrid stats={stats} loading={statsLoading} />
            <KnowledgeTable
              documents={documents}
              loading={tableLoading}
              total={total}
              page={page}
              limit={limit}
              search={search}
              selectedType={selectedType}
              onSearchChange={setSearch}
              onTypeChange={setSelectedType}
              onPageChange={setPage}
              onInspect={(id) => setInspectingDocId(id)}
              onDelete={async (id) => {
                if (confirm("Are you sure you want to delete this document and all its chunks?")) {
                  await removeDocument(id);
                }
              }}
              onDeleteMany={async (ids) => {
                if (confirm(`Are you sure you want to delete ${ids.length} documents and all their chunks?`)) {
                  await removeDocuments(ids);
                }
              }}
            />
          </div>
        )}

        {/* Tab 2: Channels & Sources Management */}
        {activeTab === "sources" && (
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            <SourceStatsGrid stats={srcStats} loading={srcStatsLoading} />
            <SourceTable
              sources={sources}
              loading={srcTableLoading}
              total={srcTotal}
              page={srcPage}
              limit={srcLimit}
              statusFilter={srcStatusFilter}
              typeFilter={srcTypeFilter}
              search={srcSearch}
              onSearchChange={setSrcSearch}
              onStatusChange={setSrcStatusFilter}
              onTypeChange={setSrcTypeFilter}
              onPageChange={setSrcPage}
              onInspect={(src) => setSelectedSource(src)}
              onEdit={(src) => openEditSourceModal(src)}
              onDelete={removeSource}
              onToggleStatus={toggleSourceStatus}
              onOpenCreate={openCreateSourceModal}
              onRefresh={refreshSources}
            />
          </div>
        )}

        {/* Tab 3: Vector Playground */}
        {activeTab === "search" && (
          <div className="flex-1 overflow-y-auto pr-1">
            <VectorPlayground
              onInspectDocument={(id) => setInspectingDocId(id)}
            />
          </div>
        )}

        {/* Tab 4: RAG Chat Studio - Fits window height */}
        {activeTab === "chat" && (
          <div className="h-full flex-1 flex flex-col min-h-0">
            <RAGChatStudio />
          </div>
        )}

        {/* Tab 5: Telegram Ingestion Logs */}
        {activeTab === "telegram" && (
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            <TelegramLogStatsGrid stats={tgStats} loading={tgStatsLoading} />
            <TelegramLogTable
              logs={tgLogs}
              loading={tgTableLoading}
              total={tgTotal}
              page={tgPage}
              limit={tgLimit}
              statusFilter={tgStatusFilter}
              search={tgSearch}
              onSearchChange={setTgSearch}
              onStatusChange={setTgStatusFilter}
              onPageChange={setTgPage}
              onInspect={(log) => setTgSelectedLog(log)}
              onDelete={removeTgLog}
              onClearAll={clearAllTgLogs}
              onRefresh={refreshTgLogs}
            />
          </div>
        )}

        {/* Tab 6: Settings & Password Update */}
        {activeTab === "settings" && (
          <div className="flex-1 overflow-y-auto pr-1">
            <AdminSettingsView user={user} onUserUpdated={refreshAuth} />
          </div>
        )}
      </main>

      {/* Modals & Slide-out Drawers */}
      <IngestModal
        isOpen={isIngestOpen}
        onClose={() => setIsIngestOpen(false)}
        onIngest={async (data) => {
          await ingestDocument(data);
        }}
      />

      <DocumentDrawer
        documentId={inspectingDocId}
        onClose={() => setInspectingDocId(null)}
        onDeleted={refreshKnowledge}
        onUpdated={refreshKnowledge}
      />

      <TelegramLogDrawer
        log={tgSelectedLog}
        onClose={() => setTgSelectedLog(null)}
        onDelete={removeTgLog}
        onInspectDocument={(docId) => setInspectingDocId(docId)}
      />

      <SourceModal
        isOpen={isSourceModalOpen}
        onClose={() => setIsSourceModalOpen(false)}
        source={editingSource}
        onSubmit={async (payload) => {
          if (editingSource) {
            await updateSource(editingSource.id, payload);
          } else {
            await createSource(payload as any);
          }
        }}
      />

      <SourceDrawer
        source={selectedSource}
        onClose={() => setSelectedSource(null)}
        onEdit={(src) => openEditSourceModal(src)}
        onToggleStatus={toggleSourceStatus}
        onDelete={removeSource}
      />

      {/* Auth Gate Modal */}
      {!user && (
        <AdminAuthModal
          hasAdmin={hasAdmin}
          onLogin={login}
          onSetup={setupAdmin}
        />
      )}
    </div>
  );
}
