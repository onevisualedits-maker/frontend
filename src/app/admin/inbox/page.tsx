'use client';

import { useCollection, useFirestore, useMemoFirebase, updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Inbox, Trash2, Mail, CheckCircle2, Clock } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminInboxPage() {
  const firestore = useFirestore();
  const q = useMemoFirebase(() => collection(firestore, 'contactSubmissions'), [firestore]);
  const { data: submissions, isLoading } = useCollection(q);

  function markAsRead(id: string) {
    const docRef = doc(firestore, 'contactSubmissions', id);
    updateDocumentNonBlocking(docRef, { status: 'Read' });
  }

  function deleteSubmission(id: string) {
    if (confirm('Are you sure you want to delete this inquiry?')) {
      const docRef = doc(firestore, 'contactSubmissions', id);
      deleteDocumentNonBlocking(docRef);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-headline text-4xl font-bold uppercase tracking-tighter mb-2">
          Contact <span className="text-primary">Inbox</span>
        </h1>
        <p className="text-muted-foreground">Manage your incoming leads and inquiries.</p>
      </div>

      <div className="grid gap-6">
        {isLoading ? (
          <div className="text-center py-20 text-muted-foreground">Loading inbox...</div>
        ) : submissions?.length === 0 ? (
          <Card className="glass-card p-20 text-center">
            <Inbox className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-20" />
            <h3 className="text-xl font-bold">Your inbox is empty</h3>
            <p className="text-muted-foreground">Check back later for new client messages.</p>
          </Card>
        ) : (
          submissions?.sort((a, b) => new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime()).map((sub) => (
            <Card key={sub.id} className={`glass-card border-white/10 ${sub.status === 'New' ? 'border-l-4 border-l-primary' : ''}`}>
              <CardHeader className="flex flex-row items-start justify-between">
                <div className="flex gap-4 items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${sub.status === 'New' ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <CardTitle className="text-xl font-bold">{sub.name}</CardTitle>
                      <Badge variant={sub.status === 'New' ? 'default' : 'secondary'} className="uppercase text-[10px] tracking-widest">
                        {sub.status === 'New' ? <Clock className="w-3 h-3 mr-1" /> : <CheckCircle2 className="w-3 h-3 mr-1" />}
                        {sub.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {sub.email} • {format(new Date(sub.submissionDate), 'MMM d, yyyy h:mm a')}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {sub.status === 'New' && (
                    <Button variant="outline" size="sm" onClick={() => markAsRead(sub.id)} className="glass-card hover:border-primary">
                      Mark Read
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => deleteSubmission(sub.id)} className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                  <p className="text-xs uppercase font-bold tracking-widest text-primary mb-2">Subject: {sub.subject || 'No Subject'}</p>
                  <p className="text-foreground leading-relaxed italic">"{sub.message}"</p>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
