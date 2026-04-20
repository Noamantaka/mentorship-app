"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

type Tab = "members" | "requests" | "credits" | "mentors" | "logs";

function getCurrentQuarter(): string {
  const now = new Date();
  const q = Math.floor(now.getMonth() / 3) + 1;
  return `${now.getFullYear()}-Q${q}`;
}

async function logAction(adminEmail: string, action: string, targetEmail: string, details: string) {
  await supabase.from("admin_logs").insert({ admin_email: adminEmail, action, target_email: targetEmail, details });
}

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>("members");
  const [session, setSession] = useState<any>(null);
  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [changePasswordError, setChangePasswordError] = useState("");
  const [changePasswordSuccess, setChangePasswordSuccess] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setChecking(false); });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => { setSession(session); });
    return () => listener.subscription.unsubscribe();
  }, []);

  const handleLogin = async () => {
    setLoggingIn(true); setLoginError(""); setResetSent(false);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setLoginError("Invalid email or password.");
    setLoggingIn(false);
  };

  const handleForgotPassword = async () => {
    if (!email) { setLoginError("Please enter your email first."); return; }
    await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/admin` });
    setResetSent(true); setLoginError("");
  };

  const handleLogout = async () => { await supabase.auth.signOut(); };

  const handleChangePassword = async () => {
    setChangePasswordError("");
    if (newPassword.length < 8) { setChangePasswordError("Password must be at least 8 characters."); return; }
    if (newPassword !== confirmPassword) { setChangePasswordError("Passwords don't match."); return; }
    setChangingPassword(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email: session.user.email, password: oldPassword });
    if (signInError) { setChangePasswordError("Old password is incorrect."); setChangingPassword(false); return; }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) { setChangePasswordError("Failed to update password."); }
    else {
      setChangePasswordSuccess(true);
      setTimeout(() => {
        setShowChangePassword(false); setOldPassword(""); setNewPassword("");
        setConfirmPassword(""); setChangePasswordSuccess(false);
      }, 2000);
    }
    setChangingPassword(false);
  };

  if (checking) return <div className="min-h-screen bg-[#F7F6F3] flex items-center justify-center text-gray-400 text-sm">Loading...</div>;

  if (!session) {
    return (
      <div className="min-h-screen bg-[#F7F6F3] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-sm space-y-4">
          <div className="flex justify-center mb-2">
            <img src="https://thelifedao.io/logos/life-logo.svg" alt="LifeDAO" className="h-12" />
          </div>
          <h1 className="text-xl font-semibold text-gray-900 text-center">Admin Login</h1>
          <div className="space-y-3">
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 placeholder-gray-400" />
            <div className="relative">
              <input type={showPassword ? "text" : "password"} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 placeholder-gray-400 pr-10" />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                )}
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="h-4 w-4 rounded border-gray-300 accent-[#7c16ff] cursor-pointer" />
              <span className="text-sm text-gray-600">Remember me</span>
            </label>
            <button type="button" onClick={handleForgotPassword} className="text-sm text-[#7c16ff] hover:underline">Forgot password?</button>
          </div>
          {loginError && <p className="text-red-500 text-sm text-center">{loginError}</p>}
          {resetSent && <p className="text-emerald-600 text-sm text-center">Reset link sent! Check your email.</p>}
          <button onClick={handleLogin} disabled={loggingIn || !email || !password}
            className="w-full py-3 rounded-xl bg-[#7c16ff] text-white text-sm font-medium hover:bg-gray-800 transition disabled:opacity-40">
            {loggingIn ? "Logging in..." : "Login"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F6F3]">
      {/* Change Password Modal */}
      {showChangePassword && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm space-y-4 shadow-xl">
            <h3 className="font-semibold text-gray-900">Change Password</h3>
            {changePasswordSuccess ? (
              <p className="text-emerald-600 text-sm text-center py-4">✅ Password updated successfully!</p>
            ) : (
              <>
                <div className="space-y-3">
                  <input type="password" placeholder="Current password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 placeholder-gray-400" />
                  <input type="password" placeholder="New password (min 8 chars)" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 placeholder-gray-400" />
                  <input type="password" placeholder="Confirm new password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 placeholder-gray-400" />
                </div>
                {changePasswordError && <p className="text-red-500 text-sm">{changePasswordError}</p>}
                <div className="flex gap-2">
                  <button onClick={handleChangePassword} disabled={changingPassword || !oldPassword || !newPassword || !confirmPassword}
                    className="flex-1 py-2.5 rounded-xl bg-[#7c16ff] text-white text-sm font-medium hover:bg-gray-800 transition disabled:opacity-40">
                    {changingPassword ? "Updating..." : "Update Password"}
                  </button>
                  <button onClick={() => { setShowChangePassword(false); setOldPassword(""); setNewPassword(""); setConfirmPassword(""); setChangePasswordError(""); }}
                    className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:text-gray-900 transition">
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="https://thelifedao.io/logos/life-logo.svg" alt="LifeDAO" className="h-8" />
          <span className="font-semibold text-gray-900">Admin Panel</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400">{session.user.email}</span>
          <button onClick={() => setShowChangePassword(true)} className="text-sm text-gray-500 hover:text-gray-900 transition">Change Password</button>
          <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-gray-900 transition">Logout</button>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex gap-2 mb-6 flex-wrap">
          {(["members", "requests", "credits", "mentors", "logs"] as Tab[]).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition capitalize ${tab === t ? "bg-[#7c16ff] text-white" : "bg-white border border-gray-200 text-gray-600 hover:text-gray-900"}`}>
              {t}
            </button>
          ))}
        </div>
        {tab === "members" && <MembersTab adminEmail={session.user.email} />}
        {tab === "requests" && <RequestsTab adminEmail={session.user.email} />}
        {tab === "credits" && <CreditsTab adminEmail={session.user.email} />}
        {tab === "mentors" && <MentorsTab adminEmail={session.user.email} />}
        {tab === "logs" && <LogsTab />}
      </div>
    </div>
  );
}

// ─── MEMBERS TAB ───────────────────────────────────────────────
function MembersTab({ adminEmail }: { adminEmail: string }) {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");
  const [newPlan, setNewPlan] = useState("basic");
  const [adding, setAdding] = useState(false);
  const [editModal, setEditModal] = useState<any | null>(null);
  const [editData, setEditData] = useState<any>({});
  const [saving, setSaving] = useState(false);

  const fetchMembers = async () => {
    setLoading(true);
    const { data } = await supabase.from("members").select("*").order("created_at", { ascending: false });
    setMembers(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchMembers(); }, []);

  const openEdit = (m: any) => {
    setEditModal(m);
    setEditData({ email: m.email, full_name: m.full_name || "", plan: m.plan, is_eligible: m.is_eligible, is_blocked: m.is_blocked });
  };

  const saveEdit = async () => {
    if (!editModal) return;
    setSaving(true);
    const wasBlocked = editModal.is_blocked;
    const nowBlocked = editData.is_blocked;
    await supabase.from("members").update({
      full_name: editData.full_name,
      plan: editData.plan,
      is_eligible: nowBlocked ? false : editData.is_eligible,
      is_blocked: nowBlocked,
    }).eq("id", editModal.id);
    const changes = [];
    if (editData.plan !== editModal.plan) changes.push(`plan: ${editModal.plan} → ${editData.plan}`);
    if (editData.is_eligible !== editModal.is_eligible) changes.push(`eligible: ${editModal.is_eligible} → ${editData.is_eligible}`);
    if (nowBlocked !== wasBlocked) changes.push(nowBlocked ? "blocked" : "unblocked");
    if (editData.full_name !== editModal.full_name) changes.push("name updated");
    await logAction(adminEmail, "EDIT_MEMBER", editModal.email, changes.join(", ") || "No changes");
    setSaving(false);
    setEditModal(null);
    fetchMembers();
  };

  const deleteMember = async (id: string, memberEmail: string) => {
    if (!confirm("Delete this member?")) return;
    await supabase.from("members").delete().eq("id", id);
    await logAction(adminEmail, "DELETE_MEMBER", memberEmail, "Member deleted");
    fetchMembers();
  };

  const addMember = async () => {
    if (!newEmail) return;
    setAdding(true);
    await supabase.from("members").insert({ email: newEmail.toLowerCase().trim(), full_name: newName, plan: newPlan, is_blocked: false, is_eligible: true });
    await logAction(adminEmail, "ADD_MEMBER", newEmail.toLowerCase().trim(), `Added with plan: ${newPlan}`);
    setNewEmail(""); setNewName(""); setNewPlan("basic"); setShowAdd(false);
    fetchMembers();
    setAdding(false);
  };

  const filtered = members.filter((m) => m.email.toLowerCase().includes(search.toLowerCase()) || m.full_name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-4">
      {editModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md space-y-4 shadow-xl">
            <h3 className="font-semibold text-gray-900">Edit Member</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
                <div className="px-3 py-2 rounded-xl border border-gray-100 bg-gray-50 text-gray-500 text-sm">{editModal.email}</div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Full Name</label>
                <input value={editData.full_name} onChange={(e) => setEditData({ ...editData, full_name: e.target.value })} placeholder="Full name"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 placeholder-gray-400" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Plan</label>
                <select value={editData.plan} onChange={(e) => setEditData({ ...editData, plan: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-gray-900 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-200">
                  <option value="basic">Basic</option>
                  <option value="premium">Premium</option>
                </select>
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={editData.is_eligible}
                    onChange={(e) => setEditData({ ...editData, is_eligible: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300 accent-[#7c16ff] cursor-pointer" />
                  <span className="text-sm text-gray-700">Eligible</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={editData.is_blocked}
                    onChange={(e) => setEditData({ ...editData, is_blocked: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300 accent-red-500 cursor-pointer" />
                  <span className="text-sm text-gray-700">Blocked</span>
                </label>
              </div>
              {editData.is_blocked && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-100">
                  <p className="text-xs text-red-700">⚠️ Blocking will also mark member as ineligible when saved.</p>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <button onClick={saveEdit} disabled={saving}
                className="flex-1 py-2.5 rounded-xl bg-[#7c16ff] text-white text-sm font-medium hover:bg-gray-800 transition disabled:opacity-40">
                {saving ? "Saving..." : "Save Changes"}
              </button>
              <button onClick={() => setEditModal(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:text-gray-900 transition">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-3">
        <input type="text" placeholder="Search by email or name..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 placeholder-gray-400" />
        <button onClick={() => setShowAdd(!showAdd)} className="px-4 py-2.5 rounded-xl bg-[#7c16ff] text-white text-sm font-medium hover:bg-gray-800 transition">+ Add Member</button>
      </div>
      {showAdd && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
          <h3 className="font-medium text-gray-900">Add New Member</h3>
          <div className="grid grid-cols-3 gap-3">
            <input type="email" placeholder="Email *" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 placeholder-gray-400" />
            <input type="text" placeholder="Full name" value={newName} onChange={(e) => setNewName(e.target.value)} className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 placeholder-gray-400" />
            <select value={newPlan} onChange={(e) => setNewPlan(e.target.value)} className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black/10">
              <option value="basic">Basic</option>
              <option value="premium">Premium</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button onClick={addMember} disabled={adding || !newEmail} className="px-4 py-2 rounded-xl bg-[#7c16ff] text-white text-sm font-medium disabled:opacity-40 hover:bg-gray-800 transition">{adding ? "Adding..." : "Add Member"}</button>
            <button onClick={() => setShowAdd(false)} className="px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:text-gray-900 transition">Cancel</button>
          </div>
        </div>
      )}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {loading ? <div className="p-8 text-center text-gray-400 text-sm">Loading...</div> : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Email</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Plan</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Eligible</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((m) => (
                <tr key={m.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 text-gray-900">{m.email}</td>
                  <td className="px-4 py-3 text-gray-600">{m.full_name || "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium ${m.plan === "premium" ? "bg-purple-50 text-purple-700" : "bg-gray-100 text-gray-600"}`}>{m.plan}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium ${m.is_eligible ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>{m.is_eligible ? "Yes" : "No"}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium ${m.is_blocked ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"}`}>{m.is_blocked ? "Blocked" : "Active"}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-3">
                      <button onClick={() => openEdit(m)} className="text-xs text-[#7c16ff] hover:underline transition">Edit</button>
                      <button onClick={() => deleteMember(m.id, m.email)} className="text-red-400 hover:text-red-600 text-xs transition">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No members found</td></tr>}
            </tbody>
          </table>
        )}
      </div>
      <p className="text-xs text-gray-400">{filtered.length} member(s)</p>
    </div>
  );
}

// ─── REQUESTS TAB ───────────────────────────────────────────────
function RequestsTab({ adminEmail }: { adminEmail: string }) {
  const [requests, setRequests] = useState<any[]>([]);
  const [mentors, setMentors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [showArchived, setShowArchived] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectModal, setRejectModal] = useState<{ requestId: string; memberEmail: string; id: string } | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [editModal, setEditModal] = useState<any | null>(null);
  const [editData, setEditData] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [filterField, setFilterField] = useState("");
  const [filterMentor, setFilterMentor] = useState("");
  const [filterQuarter, setFilterQuarter] = useState("");

  const FIELDS = ["Finance Literacy & Crypto", "Career Accelerator", "Hijra", "Entrepreneurship"];

  const fetchRequests = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("session_requests")
      .select("*, members(email, full_name), mentors(name, id)")
      .eq("is_archived", showArchived)
      .order("created_at", { ascending: false });
    setRequests(data || []);
    setLoading(false);
  };

  const fetchMentors = async () => {
    const { data } = await supabase.from("mentors").select("id, name, field, languages").eq("is_active", true).order("name");
    setMentors(data || []);
  };

  useEffect(() => { fetchRequests(); fetchMentors(); }, [showArchived]);

  useEffect(() => {
    if (editModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [editModal]);

  const handleApprove = async (id: string, requestId: string, memberEmail: string) => {
    setActionLoading(id);
    const res = await fetch("/api/session-action/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "approve", requestId }),
    });
    const data = await res.json();
    if (data.success) await logAction(adminEmail, "REQUEST_APPROVED", memberEmail, "Approved by admin with email notification");
    setActionLoading(null);
    fetchRequests();
  };

  const handleReject = async () => {
    if (!rejectModal) return;
    setActionLoading(rejectModal.id);
    const res = await fetch("/api/session-action/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reject", requestId: rejectModal.requestId, reason: rejectReason }),
    });
    const data = await res.json();
    if (data.success) await logAction(adminEmail, "REQUEST_REJECTED", rejectModal.memberEmail, `Rejected by admin. Reason: ${rejectReason}`);
    setActionLoading(null);
    setRejectModal(null);
    setRejectReason("");
    fetchRequests();
  };

  const handleDelete = async (id: string, memberEmail: string) => {
    if (!confirm("Delete this request permanently?")) return;
    await supabase.from("session_requests").delete().eq("id", id);
    await logAction(adminEmail, "DELETE_REQUEST", memberEmail, "Request deleted permanently");
    fetchRequests();
  };

  const handleArchive = async (id: string, memberEmail: string, currentArchived: boolean) => {
    await supabase.from("session_requests").update({ is_archived: !currentArchived }).eq("id", id);
    await logAction(adminEmail, currentArchived ? "UNARCHIVE_REQUEST" : "ARCHIVE_REQUEST", memberEmail, currentArchived ? "Request unarchived" : "Request archived");
    fetchRequests();
  };

  const openEdit = (r: any) => {
    setEditModal(r);
    setEditData({
      status: r.status, mentor_id: r.mentors?.id || "", field: r.field || "",
      language: r.language || "", question_1: r.question_1 || "", question_2: r.question_2 || "",
      question_3: r.question_3 || "", goal: r.goal || "", document_link: r.document_link || "",
    });
  };

  const saveEdit = async () => {
    if (!editModal) return;
    setSaving(true);
    const oldStatus = editModal.status;
    const newStatus = editData.status;
    await supabase.from("session_requests").update({
      status: newStatus, mentor_id: editData.mentor_id || null, field: editData.field,
      language: editData.language, question_1: editData.question_1, question_2: editData.question_2,
      question_3: editData.question_3, goal: editData.goal, document_link: editData.document_link,
    }).eq("id", editModal.id);

    if (oldStatus !== newStatus && editModal.request_id) {
      if (newStatus === "approved") {
        await fetch("/api/session-action/admin", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "approve", requestId: editModal.request_id }) });
      } else if (newStatus === "rejected") {
        await fetch("/api/session-action/admin", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "reject", requestId: editModal.request_id, reason: "" }) });
      }
    }
    await logAction(adminEmail, "EDIT_REQUEST", editModal.members?.email, `Request edited. Status: ${oldStatus} → ${newStatus}`);
    setSaving(false);
    setEditModal(null);
    fetchRequests();
  };

  const clearFilters = () => { setSearch(""); setFilter("all"); setFilterField(""); setFilterMentor(""); setFilterQuarter(""); };
  const hasActiveFilters = search || filter !== "all" || filterField || filterMentor || filterQuarter;

  const filtered = requests.filter((r) => {
    const matchSearch = !search || (
      r.members?.email?.toLowerCase().includes(search.toLowerCase()) ||
      r.members?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      r.mentors?.name?.toLowerCase().includes(search.toLowerCase()) ||
      r.status?.toLowerCase().includes(search.toLowerCase())
    );
    const matchStatus = filter === "all" || r.status === filter;
    const matchField = !filterField || r.field === filterField;
    const matchMentor = !filterMentor || r.mentors?.name === filterMentor;
    const matchQuarter = !filterQuarter || r.quarter === filterQuarter;
    return matchSearch && matchStatus && matchField && matchMentor && matchQuarter;
  });

  const quarters = [...new Set(requests.map(r => r.quarter).filter(Boolean))].sort().reverse();
  const statusColor: any = { pending: "bg-amber-50 text-amber-700", approved: "bg-emerald-50 text-emerald-700", rejected: "bg-red-50 text-red-700" };
  const availableMentorsForField = editData.field ? mentors.filter((m) => m.field === editData.field) : mentors;

  return (
    <div className="space-y-4">
      {editModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{backgroundColor: "rgba(0,0,0,0.4)"}}>
          <div style={{maxHeight: "85vh", overflowY: "auto"}} className="bg-white rounded-2xl p-6 w-full max-w-lg space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Edit Request</h3>
              <span className="text-xs text-gray-400">{editModal.request_id}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                <select value={editData.status} onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-gray-900 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-200">
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Field</label>
                <select value={editData.field} onChange={(e) => setEditData({ ...editData, field: e.target.value, mentor_id: "" })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-gray-900 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-200">
                  {FIELDS.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Mentor</label>
                <select value={editData.mentor_id} onChange={(e) => setEditData({ ...editData, mentor_id: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-gray-900 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-200">
                  <option value="">Select mentor...</option>
                  {availableMentorsForField.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Language</label>
                <input value={editData.language} onChange={(e) => setEditData({ ...editData, language: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200" />
              </div>
            </div>
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i}>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Question {i}</label>
                  <input value={editData[`question_${i}`]} onChange={(e) => setEditData({ ...editData, [`question_${i}`]: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200" />
                </div>
              ))}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Goal</label>
                <textarea value={editData.goal} onChange={(e) => setEditData({ ...editData, goal: e.target.value })} rows={3}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 resize-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Document Link</label>
                <input value={editData.document_link} onChange={(e) => setEditData({ ...editData, document_link: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200" />
              </div>
            </div>
            {editData.status !== editModal.status && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-100">
                <p className="text-xs text-amber-700">⚠️ Status changed from <strong>{editModal.status}</strong> to <strong>{editData.status}</strong> — an email will be sent to the mentee.</p>
              </div>
            )}
            <div className="flex gap-2">
              <button onClick={saveEdit} disabled={saving}
                className="flex-1 py-2.5 rounded-xl bg-[#7c16ff] text-white text-sm font-medium hover:bg-gray-800 transition disabled:opacity-40">
                {saving ? "Saving..." : "Save Changes"}
              </button>
              <button onClick={() => setEditModal(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:text-gray-900 transition">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {rejectModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md space-y-4 shadow-xl">
            <h3 className="font-semibold text-gray-900">Reject Request</h3>
            <p className="text-sm text-gray-500">Provide a reason for rejection (will be sent to the mentee):</p>
            <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Write the reason here..." rows={4}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 resize-none" />
            <div className="flex gap-2">
              <button onClick={handleReject} disabled={!!actionLoading}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition disabled:opacity-40">
                {actionLoading ? "Rejecting..." : "Confirm Reject"}
              </button>
              <button onClick={() => { setRejectModal(null); setRejectReason(""); }}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:text-gray-900 transition">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <input type="text" placeholder="Search by email, name, mentor or status..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 placeholder-gray-400" />
        <button onClick={() => setShowFilter(!showFilter)}
          className={`px-4 py-2.5 rounded-xl text-sm font-medium border transition ${showFilter || filterField || filterMentor || filterQuarter ? "bg-[#7c16ff] text-white border-[#7c16ff]" : "bg-white border-gray-200 text-gray-600 hover:text-gray-900"}`}>
          ⚙ Filter {(filterField || filterMentor || filterQuarter) ? "•" : ""}
        </button>
        {hasActiveFilters && (
          <button onClick={clearFilters} className="px-3 py-2.5 rounded-xl text-sm border border-gray-200 bg-white text-gray-500 hover:text-gray-900 transition">✕ Clear</button>
        )}
      </div>

      {showFilter && (
        <div className="bg-white rounded-2xl border border-gray-100 p-4 grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Field</label>
            <select value={filterField} onChange={(e) => setFilterField(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-gray-900 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black/10">
              <option value="">All Fields</option>
              {FIELDS.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Mentor</label>
            <select value={filterMentor} onChange={(e) => setFilterMentor(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-gray-900 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black/10">
              <option value="">All Mentors</option>
              {mentors.map((m) => <option key={m.id} value={m.name}>{m.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Quarter</label>
            <select value={filterQuarter} onChange={(e) => setFilterQuarter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-gray-900 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black/10">
              <option value="">All Quarters</option>
              {quarters.map((q) => <option key={q} value={q}>{q}</option>)}
            </select>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex gap-2 flex-wrap">
          {["all", "pending", "approved", "rejected"].map((s) => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition capitalize ${filter === s ? "bg-[#7c16ff] text-white" : "bg-white border border-gray-200 text-gray-600 hover:text-gray-900"}`}>
              {s} ({s === "all" ? requests.length : requests.filter(r => r.status === s).length})
            </button>
          ))}
        </div>
        <button onClick={() => setShowArchived(!showArchived)}
          className={`px-4 py-2 rounded-xl text-sm font-medium border transition ${showArchived ? "bg-[#7c16ff] text-white border-[#7c16ff]" : "bg-white border-gray-300 text-gray-800 hover:text-black"}`}>
          {showArchived ? "← Active Requests" : "🗄 Archived"}
        </button>
      </div>

      {hasActiveFilters && <p className="text-xs text-gray-400">{filtered.length} request(s) found</p>}

      <div className="space-y-3">
        {loading ? <div className="p-8 text-center text-gray-400 text-sm bg-white rounded-2xl border border-gray-100">Loading...</div> : filtered.map((r) => (
          <div key={r.id} className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium text-gray-900">{r.members?.email}</p>
                <p className="text-xs text-gray-500">{r.members?.full_name} · {r.field} · {r.language}</p>
                <p className="text-xs text-gray-500">Mentor: {r.mentors?.name} · {r.quarter}</p>
                {r.request_id && <p className="text-xs text-gray-400 mt-0.5">ID: {r.request_id}</p>}
              </div>
              <span className={`px-2 py-1 rounded-lg text-xs font-medium ${statusColor[r.status]}`}>{r.status}</span>
            </div>
            <div className="space-y-1">
              {r.question_1 && <p className="text-xs text-gray-600">Q1: {r.question_1}</p>}
              {r.question_2 && <p className="text-xs text-gray-600">Q2: {r.question_2}</p>}
              {r.question_3 && <p className="text-xs text-gray-600">Q3: {r.question_3}</p>}
              {r.goal && <p className="text-xs text-gray-600">Goal: {r.goal}</p>}
              {r.document_link && <a href={r.document_link} target="_blank" rel="noopener noreferrer" className="text-xs text-[#7c16ff] hover:underline">View Document →</a>}
            </div>
            <div className="flex gap-2 pt-1 flex-wrap">
              {r.status === "pending" && (
                <>
                  <button onClick={() => handleApprove(r.id, r.request_id, r.members?.email)} disabled={actionLoading === r.id}
                    className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-medium hover:bg-emerald-100 transition disabled:opacity-40">
                    {actionLoading === r.id ? "..." : "✓ Approve"}
                  </button>
                  <button onClick={() => setRejectModal({ requestId: r.request_id, memberEmail: r.members?.email, id: r.id })} disabled={actionLoading === r.id}
                    className="px-3 py-1.5 rounded-lg bg-red-50 text-red-700 text-xs font-medium hover:bg-red-100 transition disabled:opacity-40">
                    ✗ Reject
                  </button>
                </>
              )}
              <button onClick={() => openEdit(r)} className="px-3 py-1.5 rounded-lg bg-purple-50 text-purple-700 text-xs font-medium hover:bg-purple-100 transition">✎ Edit</button>
              <button onClick={() => handleArchive(r.id, r.members?.email, r.is_archived)} className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 text-xs font-medium hover:bg-gray-200 transition">
                {r.is_archived ? "↩ Unarchive" : "🗄 Archive"}
              </button>
              <button onClick={() => handleDelete(r.id, r.members?.email)} className="px-3 py-1.5 rounded-lg bg-red-50 text-red-500 text-xs font-medium hover:bg-red-100 transition">🗑 Delete</button>
            </div>
          </div>
        ))}
        {!loading && filtered.length === 0 && <div className="p-8 text-center text-gray-400 text-sm bg-white rounded-2xl border border-gray-100">No requests found</div>}
      </div>
    </div>
  );
}

// ─── CREDITS TAB ───────────────────────────────────────────────
function CreditsTab({ adminEmail }: { adminEmail: string }) {
  const [credits, setCredits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editUsed, setEditUsed] = useState("");
  const [editLimit, setEditLimit] = useState("");
  const quarter = getCurrentQuarter();

  const fetchCredits = async () => {
    setLoading(true);
    const { data } = await supabase.from("credits").select("*, members(email, full_name, plan)").eq("quarter", quarter).order("used", { ascending: false });
    setCredits(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchCredits(); }, []);

  const resetAll = async () => {
    if (!confirm(`Reset all credits for ${quarter}?`)) return;
    setResetting(true);
    await supabase.from("credits").update({ used: 0 }).eq("quarter", quarter);
    await logAction(adminEmail, "RESET_ALL_CREDITS", "all", `Reset all credits for ${quarter}`);
    fetchCredits();
    setResetting(false);
  };

  const resetOne = async (id: string, memberEmail: string) => {
    await supabase.from("credits").update({ used: 0 }).eq("id", id);
    await logAction(adminEmail, "RESET_CREDITS", memberEmail, `Credits reset for ${quarter}`);
    fetchCredits();
  };

  const startEdit = (c: any) => { setEditingId(c.id); setEditUsed(String(c.used)); setEditLimit(String(c.limit_count)); };
  const cancelEdit = () => { setEditingId(null); setEditUsed(""); setEditLimit(""); };

  const saveEdit = async (id: string, memberEmail: string) => {
    await supabase.from("credits").update({ used: parseInt(editUsed), limit_count: parseInt(editLimit) }).eq("id", id);
    await logAction(adminEmail, "EDIT_CREDITS", memberEmail, `Credits updated: used=${editUsed}, limit=${editLimit}`);
    setEditingId(null);
    fetchCredits();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-gray-900">Credits — {quarter}</h2>
          <p className="text-xs text-gray-500 mt-0.5">{credits.length} members with activity this quarter</p>
        </div>
        <button onClick={resetAll} disabled={resetting} className="px-4 py-2.5 rounded-xl bg-red-50 text-red-700 text-sm font-medium hover:bg-red-100 transition disabled:opacity-40">
          {resetting ? "Resetting..." : "Reset All Credits"}
        </button>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {loading ? <div className="p-8 text-center text-gray-400 text-sm">Loading...</div> : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Email</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Plan</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Used</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Limit</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Remaining</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {credits.map((c) => (
                editingId === c.id ? (
                  <tr key={c.id} className="bg-purple-50">
                    <td className="px-4 py-2 text-gray-900 text-xs">{c.members?.email}</td>
                    <td className="px-4 py-2"><span className={`px-2 py-1 rounded-lg text-xs font-medium ${c.members?.plan === "premium" ? "bg-purple-50 text-purple-700" : "bg-gray-100 text-gray-600"}`}>{c.members?.plan}</span></td>
                    <td className="px-3 py-2"><input type="number" value={editUsed} onChange={(e) => setEditUsed(e.target.value)} min="0" className="w-16 px-2 py-1 rounded-lg border border-gray-200 text-gray-900 text-xs focus:outline-none focus:ring-2 focus:ring-purple-200" /></td>
                    <td className="px-3 py-2"><input type="number" value={editLimit} onChange={(e) => setEditLimit(e.target.value)} min="0" className="w-16 px-2 py-1 rounded-lg border border-gray-200 text-gray-900 text-xs focus:outline-none focus:ring-2 focus:ring-purple-200" /></td>
                    <td className="px-4 py-2 text-gray-400 text-xs">—</td>
                    <td className="px-3 py-2">
                      <div className="flex gap-2">
                        <button onClick={() => saveEdit(c.id, c.members?.email)} className="px-2 py-1 rounded-lg bg-[#7c16ff] text-white text-xs font-medium hover:bg-gray-800 transition">Save</button>
                        <button onClick={cancelEdit} className="px-2 py-1 rounded-lg border border-gray-200 text-xs text-gray-600 hover:text-gray-900 transition">Cancel</button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <tr key={c.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 text-gray-900">{c.members?.email}</td>
                    <td className="px-4 py-3"><span className={`px-2 py-1 rounded-lg text-xs font-medium ${c.members?.plan === "premium" ? "bg-purple-50 text-purple-700" : "bg-gray-100 text-gray-600"}`}>{c.members?.plan}</span></td>
                    <td className="px-4 py-3 font-medium text-gray-900">{c.used}</td>
                    <td className="px-4 py-3 text-gray-500">{c.limit_count}</td>
                    <td className="px-4 py-3"><span className={`font-medium ${c.limit_count - c.used <= 0 ? "text-red-500" : "text-emerald-600"}`}>{c.limit_count - c.used}</span></td>
                    <td className="px-4 py-3">
                      <div className="flex gap-3">
                        <button onClick={() => startEdit(c)} className="text-xs text-[#7c16ff] hover:underline transition">Edit</button>
                        <button onClick={() => resetOne(c.id, c.members?.email)} className="text-xs text-gray-400 hover:text-gray-600 transition">Reset</button>
                      </div>
                    </td>
                  </tr>
                )
              ))}
              {credits.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No credits this quarter</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ─── MENTORS TAB ───────────────────────────────────────────────
function MentorsTab({ adminEmail }: { adminEmail: string }) {
  const [mentors, setMentors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>({});
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newField, setNewField] = useState("Career Accelerator");
  const [newLanguages, setNewLanguages] = useState("");
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);

  const FIELDS = ["Finance Literacy & Crypto", "Career Accelerator", "Hijra", "Entrepreneurship"];

  const fetchMentors = async () => {
    setLoading(true);
    const { data } = await supabase.from("mentors").select("*").order("field");
    setMentors(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchMentors(); }, []);

  const toggleActive = async (id: string, current: boolean, name: string) => {
    await supabase.from("mentors").update({ is_active: !current }).eq("id", id);
    await logAction(adminEmail, current ? "DEACTIVATE_MENTOR" : "ACTIVATE_MENTOR", name, `Mentor ${current ? "deactivated" : "activated"}`);
    fetchMentors();
  };

  const deleteMentor = async (id: string, name: string) => {
    if (!confirm("Delete this mentor?")) return;
    await supabase.from("mentors").delete().eq("id", id);
    await logAction(adminEmail, "DELETE_MENTOR", name, "Mentor deleted");
    fetchMentors();
  };

  const startEdit = (m: any) => { setEditingId(m.id); setEditData({ name: m.name, email: m.email || "", field: m.field, languages: m.languages?.join(", ") || "" }); };
  const cancelEdit = () => { setEditingId(null); setEditData({}); };

  const saveEdit = async () => {
    setSaving(true);
    const langs = editData.languages.split(",").map((l: string) => l.trim()).filter(Boolean);
    await supabase.from("mentors").update({ name: editData.name, email: editData.email, field: editData.field, languages: langs }).eq("id", editingId);
    await logAction(adminEmail, "EDIT_MENTOR", editData.name, "Mentor updated");
    setEditingId(null);
    fetchMentors();
    setSaving(false);
  };

  const addMentor = async () => {
    if (!newName) return;
    setAdding(true);
    const langs = newLanguages.split(",").map((l) => l.trim()).filter(Boolean);
    await supabase.from("mentors").insert({ name: newName, email: newEmail, field: newField, languages: langs, is_active: true });
    await logAction(adminEmail, "ADD_MENTOR", newName, `Mentor added to ${newField}`);
    setNewName(""); setNewEmail(""); setNewLanguages(""); setShowAdd(false);
    fetchMentors();
    setAdding(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => setShowAdd(!showAdd)} className="px-4 py-2.5 rounded-xl bg-[#7c16ff] text-white text-sm font-medium hover:bg-gray-800 transition">+ Add Mentor</button>
      </div>
      {showAdd && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
          <h3 className="font-medium text-gray-900">Add New Mentor</h3>
          <div className="grid grid-cols-2 gap-3">
            <input type="text" placeholder="Full name *" value={newName} onChange={(e) => setNewName(e.target.value)} className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 placeholder-gray-400" />
            <input type="email" placeholder="Email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 placeholder-gray-400" />
            <select value={newField} onChange={(e) => setNewField(e.target.value)} className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black/10">
              {FIELDS.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
            <input type="text" placeholder="Languages (e.g. English, French)" value={newLanguages} onChange={(e) => setNewLanguages(e.target.value)} className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 placeholder-gray-400" />
          </div>
          <div className="flex gap-2">
            <button onClick={addMentor} disabled={adding || !newName} className="px-4 py-2 rounded-xl bg-[#7c16ff] text-white text-sm font-medium disabled:opacity-40 hover:bg-gray-800 transition">{adding ? "Adding..." : "Add Mentor"}</button>
            <button onClick={() => setShowAdd(false)} className="px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:text-gray-900 transition">Cancel</button>
          </div>
        </div>
      )}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {loading ? <div className="p-8 text-center text-gray-400 text-sm">Loading...</div> : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Email</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Field</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Languages</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {mentors.map((m) => (
                editingId === m.id ? (
                  <tr key={m.id} className="bg-purple-50">
                    <td className="px-3 py-2"><input value={editData.name} onChange={(e) => setEditData({ ...editData, name: e.target.value })} className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-gray-900 text-xs focus:outline-none focus:ring-2 focus:ring-purple-200" /></td>
                    <td className="px-3 py-2"><input type="email" value={editData.email} onChange={(e) => setEditData({ ...editData, email: e.target.value })} placeholder="Email" className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-gray-900 text-xs focus:outline-none focus:ring-2 focus:ring-purple-200 placeholder-gray-400" /></td>
                    <td className="px-3 py-2">
                      <select value={editData.field} onChange={(e) => setEditData({ ...editData, field: e.target.value })} className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-gray-900 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-purple-200">
                        {FIELDS.map((f) => <option key={f} value={f}>{f}</option>)}
                      </select>
                    </td>
                    <td className="px-3 py-2"><input value={editData.languages} onChange={(e) => setEditData({ ...editData, languages: e.target.value })} placeholder="English, French" className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-gray-900 text-xs focus:outline-none focus:ring-2 focus:ring-purple-200 placeholder-gray-400" /></td>
                    <td className="px-3 py-2 text-gray-400 text-xs">—</td>
                    <td className="px-3 py-2">
                      <div className="flex gap-2">
                        <button onClick={saveEdit} disabled={saving} className="px-2 py-1 rounded-lg bg-[#7c16ff] text-white text-xs font-medium disabled:opacity-40 hover:bg-gray-800 transition">{saving ? "..." : "Save"}</button>
                        <button onClick={cancelEdit} className="px-2 py-1 rounded-lg border border-gray-200 text-xs text-gray-600 hover:text-gray-900 transition">Cancel</button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <tr key={m.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-medium text-gray-900">{m.name}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{m.email || "—"}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{m.field}</td>
                    <td className="px-4 py-3"><div className="flex gap-1 flex-wrap">{m.languages?.map((l: string) => <span key={l} className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 text-xs">{l}</span>)}</div></td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleActive(m.id, m.is_active, m.name)} className={`px-2 py-1 rounded-lg text-xs font-medium ${m.is_active ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>{m.is_active ? "Active" : "Inactive"}</button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-3">
                        <button onClick={() => startEdit(m)} className="text-xs text-[#7c16ff] hover:underline transition">Edit</button>
                        <button onClick={() => deleteMentor(m.id, m.name)} className="text-xs text-red-400 hover:text-red-600 transition">Delete</button>
                      </div>
                    </td>
                  </tr>
                )
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ─── LOGS TAB ───────────────────────────────────────────────
function LogsTab() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchLogs = async () => {
    setLoading(true);
    const { data } = await supabase.from("admin_logs").select("*").order("created_at", { ascending: false }).limit(200);
    setLogs(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchLogs(); }, []);

  const actionColor: any = {
    BLOCK_MEMBER: "bg-red-50 text-red-700", UNBLOCK_MEMBER: "bg-emerald-50 text-emerald-700",
    DELETE_MEMBER: "bg-red-50 text-red-700", DELETE_MENTOR: "bg-red-50 text-red-700",
    ADD_MEMBER: "bg-blue-50 text-blue-700", ADD_MENTOR: "bg-blue-50 text-blue-700",
    CHANGE_PLAN: "bg-purple-50 text-purple-700", MARK_ELIGIBLE: "bg-emerald-50 text-emerald-700",
    MARK_INELIGIBLE: "bg-amber-50 text-amber-700", RESET_CREDITS: "bg-amber-50 text-amber-700",
    RESET_ALL_CREDITS: "bg-red-50 text-red-700", EDIT_CREDITS: "bg-purple-50 text-purple-700",
    EDIT_MENTOR: "bg-purple-50 text-purple-700", REQUEST_APPROVED: "bg-emerald-50 text-emerald-700",
    REQUEST_REJECTED: "bg-red-50 text-red-700", ACTIVATE_MENTOR: "bg-emerald-50 text-emerald-700",
    DEACTIVATE_MENTOR: "bg-amber-50 text-amber-700", EDIT_REQUEST: "bg-purple-50 text-purple-700",
    DELETE_REQUEST: "bg-red-50 text-red-700", ARCHIVE_REQUEST: "bg-gray-100 text-gray-600",
    UNARCHIVE_REQUEST: "bg-blue-50 text-blue-700", EDIT_MEMBER: "bg-purple-50 text-purple-700",
  };

  const filtered = logs.filter((l) =>
    l.target_email?.toLowerCase().includes(search.toLowerCase()) ||
    l.action?.toLowerCase().includes(search.toLowerCase()) ||
    l.admin_email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-gray-900">Activity Log</h2>
          <p className="text-xs text-gray-500 mt-0.5">Last 200 actions</p>
        </div>
        <button onClick={fetchLogs} className="px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:text-gray-900 transition">↻ Refresh</button>
      </div>
      <input type="text" placeholder="Search by email or action..." value={search} onChange={(e) => setSearch(e.target.value)}
        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 placeholder-gray-400" />
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {loading ? <div className="p-8 text-center text-gray-400 text-sm">Loading...</div> : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Time</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Action</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Target</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Details</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((l) => (
                <tr key={l.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">{new Date(l.created_at).toLocaleString()}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-1 rounded-lg text-xs font-medium ${actionColor[l.action] || "bg-gray-100 text-gray-600"}`}>{l.action}</span></td>
                  <td className="px-4 py-3 text-gray-900 text-xs">{l.target_email}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{l.details}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{l.admin_email}</td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No logs found</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}