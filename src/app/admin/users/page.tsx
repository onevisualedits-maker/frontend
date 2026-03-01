'use client';

import { useState } from 'react';
import { useCollection, useFirestore, useMemoFirebase, addDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { collection, query, orderBy, doc, addDoc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Users, Mail, Loader2, Trash2, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

export default function AdminUsersPage() {
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviting, setInviting] = useState(false);

    const firestore = useFirestore();
    const { toast } = useToast();

    const adminsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'roles_admin'));
    }, [firestore]);
    const { data: admins, isLoading: loadingAdmins } = useCollection(adminsQuery);

    const invitesQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'invitations'), orderBy('date', 'desc'));
    }, [firestore]);
    const { data: invitations, isLoading: loadingInvites } = useCollection(invitesQuery);

    async function handleInvite(e: React.FormEvent) {
        e.preventDefault();
        if (!inviteEmail || !firestore) return;

        setInviting(true);
        try {
            // 1. Add to Firestore 'invitations' collection
            const inviteRef = await addDoc(collection(firestore, 'invitations'), {
                email: inviteEmail.toLowerCase(),
                date: new Date().toISOString(),
                status: 'Pending'
            });

            // 2. Transmit Email
            const res = await fetch('/api/invite', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: inviteEmail, inviteId: inviteRef.id }),
            });

            if (!res.ok) throw new Error("Email sending failed");

            toast({
                title: "Invitation Sent",
                description: `An invite link has been emailed to ${inviteEmail}.`,
            });
            setInviteEmail('');
        } catch (err: any) {
            toast({
                variant: "destructive",
                title: "Error Sending Invite",
                description: err.message || "Could not complete the process.",
            });
        } finally {
            setInviting(false);
        }
    }

    function rescindInvite(id: string) {
        if (confirm("Are you sure you want to cancel this invitation?") && firestore) {
            deleteDocumentNonBlocking(doc(firestore, 'invitations', id));
            toast({ title: "Invitation Cancelled", description: "The invitation link has been revoked." });
        }
    }

    function removeAdmin(id: string, adminEmail: string) {
        if (confirm(`Are you sure you want to revoke admin access for ${adminEmail}? This does not delete their auth account but removes their permissions.`) && firestore) {
            deleteDocumentNonBlocking(doc(firestore, 'roles_admin', id));
            toast({ title: "Admin Revoked", description: "Access has been successfully removed." });
        }
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="font-headline text-4xl font-bold uppercase tracking-tighter mb-2">
                    User <span className="text-primary">Management</span>
                </h1>
                <p className="text-muted-foreground">Manage your team and control who has access to the admin portal.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Send Invitation Card */}
                <Card className="glass-card border-white/10 shadow-xl h-fit">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Send className="w-5 h-5 text-primary" /> Invite New Admin</CardTitle>
                        <CardDescription>Send an email invitation allowing a user to set their password and join the platform.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleInvite} className="flex flex-col gap-4">
                            <div className="space-y-2">
                                <label className="text-xs uppercase font-bold tracking-widest text-muted-foreground">User Email Address</label>
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="teammate@example.com"
                                        type="email"
                                        required
                                        value={inviteEmail}
                                        onChange={(e) => setInviteEmail(e.target.value)}
                                        className="glass-card border-white/10"
                                    />
                                    <Button type="submit" disabled={inviting} className="lavender-gradient min-w-[120px]">
                                        {inviting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send Invite'}
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Pending Invitations Card */}
                <Card className="glass-card border-white/10 shadow-xl h-fit">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Mail className="w-5 h-5 text-primary" /> Pending Invitations</CardTitle>
                        <CardDescription>Users who have been invited but have not yet registered.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loadingInvites ? (
                            <p className="text-muted-foreground">Loading...</p>
                        ) : !invitations || invitations.length === 0 ? (
                            <p className="text-sm text-muted-foreground p-4 bg-white/5 rounded-lg border border-white/10 text-center">No pending invitations.</p>
                        ) : (
                            <ul className="space-y-4">
                                {invitations.map((inv: any) => (
                                    <li key={inv.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                                        <div>
                                            <p className="font-bold">{inv.email}</p>
                                            <p className="text-xs text-muted-foreground">Invited on {format(new Date(inv.date), 'MMM d, yyyy')}</p>
                                        </div>
                                        <Button variant="ghost" size="icon" onClick={() => rescindInvite(inv.id)} className="text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </CardContent>
                </Card>

                {/* Active Admins Card */}
                <Card className="glass-card border-white/10 shadow-xl col-span-1 lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Users className="w-5 h-5 text-primary" /> Active Administrators</CardTitle>
                        <CardDescription>Users with current dashboard access.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loadingAdmins ? (
                            <p className="text-muted-foreground">Loading team...</p>
                        ) : !admins || admins.length === 0 ? (
                            <p className="text-sm text-muted-foreground p-4 bg-white/5 rounded-lg border border-white/10 text-center">No admins found.</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {admins.map((admin: any) => (
                                    <div key={admin.id} className="p-5 bg-white/5 rounded-2xl border border-white/10 flex flex-col justify-between">
                                        <div>
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="w-10 h-10 rounded-full lavender-gradient flex items-center justify-center text-white font-bold text-lg">
                                                    {(admin.email || '?').charAt(0).toUpperCase()}
                                                </div>
                                                <Badge variant="outline" className="uppercase text-[10px] tracking-widest text-primary border-primary/30">
                                                    {admin.role || 'Admin'}
                                                </Badge>
                                            </div>
                                            <p className="font-bold text-lg mb-1 break-all">{admin.email}</p>
                                            {admin.setupDate && (
                                                <p className="text-xs text-muted-foreground mb-4">Joined {format(new Date(admin.setupDate), 'MMMM yyyy')}</p>
                                            )}
                                        </div>
                                        {admin.role !== 'super-admin' && (
                                            <Button variant="ghost" size="sm" onClick={() => removeAdmin(admin.id, admin.email)} className="w-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 mt-auto">
                                                <Trash2 className="w-4 h-4 mr-2" /> Revoke Access
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
