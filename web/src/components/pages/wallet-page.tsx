'use client';

import * as React from 'react';
import { ArrowUpRight, ArrowDownLeft, Plus, Eye, EyeOff, CreditCard, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loading } from '@/components/ui/loading';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { useAuth, withAuth } from '@/contexts/auth-context';
import { walletApi } from '@/lib/api';
import { Wallet, Transaction } from '@/types';
import { formatNaira, formatTimeAgo } from '@/lib/utils';

function WalletPageComponent(): React.ReactElement {
  const { user } = useAuth();
  const [wallet, setWallet] = React.useState<Wallet | null>(null);
  const [transactions, setTransactions] = React.useState<Transaction[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [showBalance, setShowBalance] = React.useState(true);

  // Transform user data for Header component
  const headerUser = user ? {
    id: user.id,
    name: `${user.firstName} ${user.lastName}`,
    ...(user.avatar && { avatar: user.avatar }),
  } : undefined;

  const fetchWalletData = React.useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      // Fetch wallet info and transactions in parallel
      const [walletResponse, transactionsResponse] = await Promise.all([
        walletApi.getWallet(),
        walletApi.getTransactions({ limit: 20 }),
      ]);

      setWallet(walletResponse.data as Wallet);
      setTransactions(transactionsResponse.data as Transaction[]);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load wallet data');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchWalletData();
  }, [fetchWalletData]);

  const handleTopUp = (): void => {
    // TODO: Implement top-up modal/flow
    console.log('Top up wallet');
  };

  const handleWithdraw = (): void => {
    // TODO: Implement withdrawal modal/flow
    console.log('Withdraw funds');
  };

  const getTransactionIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'topup':
        return <ArrowDownLeft className="h-4 w-4 text-secondary" />;
      case 'withdrawal':
        return <ArrowUpRight className="h-4 w-4 text-accent" />;
      case 'payment':
        return <ArrowUpRight className="h-4 w-4 text-red-500" />;
      case 'escrow_hold':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'escrow_release':
        return <CheckCircle className="h-4 w-4 text-secondary" />;
      case 'refund':
        return <ArrowDownLeft className="h-4 w-4 text-secondary" />;
      default:
        return <CreditCard className="h-4 w-4 text-neutral-gray" />;
    }
  };

  const getTransactionStatusBadge = (status: Transaction['status']) => {
    switch (status) {
      case 'completed':
        return <Badge variant="secondary">Completed</Badge>;
      case 'pending':
        return <Badge variant="default">Pending</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'cancelled':
        return <Badge variant="outline">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTransactionAmount = (transaction: Transaction) => {
    const isCredit = ['topup', 'escrow_release', 'refund'].includes(transaction.type);
    const prefix = isCredit ? '+' : '-';
    return `${prefix}${formatNaira(transaction.amountInKobo)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background-light">
        <Header user={headerUser} />
        <div className="flex items-center justify-center py-20">
          <Loading size="lg" />
        </div>
      </div>
    );
  }

  if (error && !wallet) {
    return (
      <div className="min-h-screen bg-background-light">
        <Header user={headerUser} />
        <div className="container mx-auto px-4 py-20">
          <div className="text-center">
            <div className="mb-4">
              <XCircle className="h-16 w-16 text-red-500 mx-auto" />
            </div>
            <h2 className="heading-2 mb-4">Failed to Load Wallet</h2>
            <p className="subtext mb-6">{error}</p>
            <Button onClick={fetchWalletData}>Try Again</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light">
      <Header user={headerUser} />

      <div className="container mx-auto px-4 py-8">
        {/* Wallet Overview */}
        <div className="mb-8">
          <h1 className="heading-1 mb-6">My Wallet</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Main Balance Card */}
            <Card className="md:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Available Balance</CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowBalance(!showBalance)}
                >
                  {showBalance ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary mb-2 naira-symbol">
                  {showBalance 
                    ? formatNaira(wallet?.balanceInKobo || 0)
                    : '₦••••••'
                  }
                </div>
                <p className="text-sm text-neutral-gray">
                  Total earned: {formatNaira(wallet?.totalEarnedInKobo || 0)}
                </p>
                
                <div className="flex gap-3 mt-6">
                  <Button onClick={handleTopUp} className="flex-1">
                    <Plus className="h-4 w-4 mr-2" />
                    Top Up
                  </Button>
                  <Button variant="outline" onClick={handleWithdraw} className="flex-1">
                    <ArrowUpRight className="h-4 w-4 mr-2" />
                    Withdraw
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Escrow Balance Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Escrow Balance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600 mb-2 naira-symbol">
                  {showBalance 
                    ? formatNaira(wallet?.escrowBalanceInKobo || 0)
                    : '₦••••••'
                  }
                </div>
                <p className="text-sm text-neutral-gray">
                  Funds held in active trades
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-xl font-bold text-secondary">
                {formatNaira(wallet?.totalEarnedInKobo || 0)}
              </div>
              <p className="text-sm text-neutral-gray">Total Earned</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-xl font-bold text-accent">
                {formatNaira(wallet?.totalSpentInKobo || 0)}
              </div>
              <p className="text-sm text-neutral-gray">Total Spent</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-xl font-bold text-primary">
                {transactions.filter(t => t.status === 'completed').length}
              </div>
              <p className="text-sm text-neutral-gray">Completed</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-xl font-bold text-yellow-600">
                {transactions.filter(t => t.status === 'pending').length}
              </div>
              <p className="text-sm text-neutral-gray">Pending</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Transactions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Transactions</CardTitle>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </CardHeader>
          <CardContent>
            {transactions.length > 0 ? (
              <div className="space-y-4">
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 border border-border-gray rounded-lg hover:bg-neutral-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-neutral-50 rounded-full">
                        {getTransactionIcon(transaction.type)}
                      </div>
                      <div>
                        <p className="font-medium text-neutral-dark">
                          {transaction.description}
                        </p>
                        <p className="text-sm text-neutral-gray">
                          {formatTimeAgo(new Date(transaction.createdAt))} • Ref: {transaction.reference}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className={`font-semibold naira-symbol ${
                        ['topup', 'escrow_release', 'refund'].includes(transaction.type)
                          ? 'text-secondary'
                          : 'text-red-500'
                      }`}>
                        {getTransactionAmount(transaction)}
                      </p>
                      {getTransactionStatusBadge(transaction.status)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="mb-4">
                  <CreditCard className="h-12 w-12 text-neutral-gray mx-auto" />
                </div>
                <h3 className="heading-2 mb-2">No Transactions Yet</h3>
                <p className="subtext mb-4">
                  Your transaction history will appear here
                </p>
                <Button onClick={handleTopUp}>
                  Make Your First Top Up
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}

const WalletPage = withAuth(WalletPageComponent);
export default WalletPage;