import React, { useState, useEffect, useMemo } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import pb from '../lib/pocketbase';
import './ProductPage.css';
// Adding Recharts for the analytics tab
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const PB_COLLECTABLES = 'collectables';
const PB_LOGS = 'activity_ledger';

const STATUS_LABELS = {
  0: "Verified",
  1: "Not Verified",
  2: "For Sale",
  3: "Not For Sale"
};

export default function ProductPage() {
  const navigate = useNavigate();
  const { itemIndex } = useParams(); 
  const [product, setProduct] = useState(null);
  const [productImageUrl, setProductImageUrl] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('history'); // 'history', 'analytics', or 'tags'

  const statusLabel = STATUS_LABELS[product?.status] || "Verified";
  const categoryLabel = product?.expand?.category?.name || "Uncategorized";

  // --- DYNAMIC CHART LOGIC ---
  const chartData = useMemo(() => {
    return transactions
      .filter(log => log.action?.toLowerCase().includes('price') || log.action?.toLowerCase().includes('value'))
      .map(log => {
        const effectiveDate = log.event_date ? new Date(log.event_date) : new Date(log.created);
        return {
          date: effectiveDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
          year: effectiveDate.getFullYear(),
          price: parseFloat(log.new_value.replace(/[^0-9.]/g, '')),
          fullDate: effectiveDate
        };
      })
      .sort((a, b) => a.fullDate - b.fullDate);
  }, [transactions]);

  // --- TAG EVOLUTION LOGIC ---
  const tagEvolution = useMemo(() => {
    const added = transactions.filter(log => log.action?.toLowerCase().includes('tag added'));
    const removed = transactions.filter(log => log.action?.toLowerCase().includes('tag removed'));
    return { 
      added, 
      removed, 
      hasChanges: added.length > 0 || removed.length > 0 
    };
  }, [transactions]);

  // --- CALCULATE PERFORMANCE METRICS ---
  const marketStats = useMemo(() => {
    if (chartData.length < 2) return null;
    const now = new Date();
    const thirtyDaysAgo = new Date().setDate(now.getDate() - 30);
    const startPrice = chartData[0].price;
    const currentPrice = chartData[chartData.length - 1].price;
    const allTimeDiff = currentPrice - startPrice;
    const allTimePercent = ((allTimeDiff / startPrice) * 100).toFixed(2);
    const logsWithin30 = chartData.filter(d => d.fullDate >= thirtyDaysAgo);
    let monthlyPercent = "0.00";
    let isMonthlyPositive = true;
    if (logsWithin30.length >= 2) {
      const monthStart = logsWithin30[0].price;
      const monthDiff = currentPrice - monthStart;
      monthlyPercent = ((monthDiff / monthStart) * 100).toFixed(2);
      isMonthlyPositive = monthDiff >= 0;
    }
    const timeSpan = `${chartData[0].date} ${chartData[0].year} — ${chartData[chartData.length - 1].date} ${chartData[chartData.length - 1].year}`;
    return {
      allTimePercent,
      isAllTimePositive: allTimeDiff >= 0,
      monthlyPercent,
      isMonthlyPositive,
      timeSpan,
      allTimeDiff: allTimeDiff.toLocaleString()
    };
  }, [chartData]);

  const hasPriceHistory = chartData.length > 1;

  useEffect(() => {
    window.scrollTo(0, 0);
    async function loadProduct() {
      if (!itemIndex) return;
      try {
        setIsLoading(true);
        const record = await pb.collection(PB_COLLECTABLES).getOne(itemIndex, {
          expand: 'category,tags,created_by',
          $autoCancel: false 
        });

        const logs = await pb.collection(PB_LOGS).getFullList({
          filter: `collectible_id = "${itemIndex}"`,
          sort: '-created',
          expand: 'changed_by',
          $autoCancel: false
        });

        // Debug: Check if 'created_by' is present in the expand object
        console.log("Expanded data check:", record.expand);

        setProduct({
          ...record,
          collectible_name: record.name,
          price: record.estimated_value,
          ownerId: record.expand?.created_by?.id,
          ownership: record.expand?.created_by?.name || record.expand?.created_by?.username || "Unknown Owner",
          displayTags: record.expand?.tags || []
        });
        setTransactions(logs);
        if (record.images?.length) {
          setProductImageUrl(pb.files.getURL(record, record.images[0]));
        }
      } catch (err) {
        console.error("Vault access failed:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadProduct();
  }, [itemIndex]);

  if (isLoading) return <div className="loading-screen">Accessing Secure Vault...</div>;
  if (!product) return <div className="loading-screen text-red-500">Asset Data Corrupted</div>;

  return (
    <div className="product-container">
      <aside className="panel-visuals">
        <div className="visuals-top-stack">
          <div className="hero-image-aligned">
            {productImageUrl ? (
              <img src={productImageUrl} alt={product.collectible_name} className="w-full h-full object-cover" />
            ) : (
              <div className="flex items-center justify-center h-full w-full uppercase tracking-[0.5em] text-[var(--border-color)] font-bold text-[10px]">
                Asset View
              </div>
            )}
          </div>
          <div className="thumb-scroller-aligned">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="thumb-box-aligned flex items-center justify-center uppercase text-[10px] tracking-widest text-[var(--border-color)]">
                Pic
              </div>
            ))}
          </div>
        </div>

        <div className="info-technical-grid">
          <div className="tech-row">
            <div className="flex flex-col">
              <span className="label-gold-dim">Asset Status</span>
              <span className="tech-value text-green-400">{statusLabel}</span>
            </div>
            <div className="flex flex-col text-right">
              <span className="label-gold-dim">Market Value</span>
              <span className="tech-value text-[var(--accent-color)] font-bold">$ {Number(product.price).toLocaleString()}</span>
            </div>
          </div>
          <div className="tech-row border-b-0">
            <div className="flex flex-col">
              <span className="label-gold-dim">Owner</span>
              {product.ownerId ? (
                <Link 
                  to={`/profile/${product.ownerId}`} 
                  className="tech-value hover:text-[var(--accent-color)] transition-colors cursor-pointer"
                >
                  {product.ownership}
                </Link>
              ) : (
                <span className="tech-value">{product.ownership}</span>
              )}
            </div>
          </div>
        </div>
      </aside>

      <main className="panel-info">
        <header className="product-header">
          <h2 className="product-title">{product.collectible_name}</h2>
          <div className="header-meta-row">
            <div className="meta-stack">
              <span className="label-gold">Category</span>
              <span className="category-text">{categoryLabel}</span>
            </div>
            <div className="meta-stack text-right items-end">
              <span className="label-gold">Tags</span>
              <div className="tag-cloud-inline">
                {product.displayTags.map((tagRecord) => (
                  <button key={tagRecord.id} className="tag-item">{tagRecord.name}</button>
                ))}
              </div>
            </div>
          </div>
        </header>

        <div className="description-box">
          <span className="label-gold block mb-2">Item Description</span>
          <p className="description-text">{product.description || "No description provided."}</p>
        </div>

        <div className="history-section mt-8">
          <div className="flex gap-8 mb-4 border-b border-white/10">
            <button 
              onClick={() => setActiveTab('history')}
              className={`pb-2 text-[10px] font-bold uppercase tracking-[0.3em] transition-all ${activeTab === 'history' ? 'text-[var(--accent-color)] border-b-2 border-[var(--accent-color)]' : 'opacity-40'}`}
            >
              Transaction Ledger
            </button>
            
            {hasPriceHistory && (
              <button 
                onClick={() => setActiveTab('analytics')}
                className={`pb-2 text-[10px] font-bold uppercase tracking-[0.3em] transition-all ${activeTab === 'analytics' ? 'text-[var(--accent-color)] border-b-2 border-[var(--accent-color)]' : 'opacity-40'}`}
              >
                Market Analytics
              </button>
            )}

            {tagEvolution.hasChanges && (
              <button 
                onClick={() => setActiveTab('tags')}
                className={`pb-2 text-[10px] font-bold uppercase tracking-[0.3em] transition-all ${activeTab === 'tags' ? 'text-[var(--accent-color)] border-b-2 border-[var(--accent-color)]' : 'opacity-40'}`}
              >
                Tag Evolution
              </button>
            )}
          </div>

          <div className="history-scroll-container">
            {activeTab === 'history' && (
              transactions.length > 0 ? (
                transactions.map((log) => (
                  <div key={log.id} className="history-row flex justify-between border-b border-white/5 py-4 last:border-0">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--accent-color)]">{log.action}</span>
                      <span className="text-[11px] opacity-70">
                        <span className="opacity-40">{log.previous_value}</span>
                        <span className="mx-2 text-[var(--accent-color)]">→</span>
                        <span className="text-white">{log.new_value}</span>
                      </span>
                    </div>
                    <div className="text-right flex flex-col justify-center">
                      <span className="text-[10px] opacity-40 font-mono">
                        {new Date(log.event_date || log.created).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="history-row flex justify-between py-4">
                   <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--accent-color)]">Genesis Entry</span>
                   <span className="text-[10px] opacity-40 font-mono">{new Date(product.created).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}</span>
                </div>
              )
            )}

            {activeTab === 'analytics' && (
              <div className="w-full pt-4">
                <div className="flex justify-between items-start mb-8 border-l-2 border-[var(--accent-color)] pl-6">
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] uppercase tracking-[0.4em] opacity-40">Valuation Window</span>
                    <span className="text-[13px] font-mono tracking-widest text-white">{marketStats?.timeSpan}</span>
                  </div>
                  <div className="flex gap-12">
                    <div className="text-right flex flex-col">
                      <span className="text-[9px] uppercase tracking-[0.4em] opacity-40 mb-1">Last 30 Days</span>
                      <span className={`text-[15px] font-bold ${marketStats?.isMonthlyPositive ? 'text-green-400' : 'text-red-400'}`}>
                        {marketStats?.isMonthlyPositive ? '+' : ''}{marketStats?.monthlyPercent}%
                      </span>
                    </div>
                    <div className="text-right flex flex-col">
                      <span className="text-[9px] uppercase tracking-[0.4em] opacity-40 mb-1">All-Time Yield</span>
                      <span className={`text-[18px] font-bold tracking-tighter ${marketStats?.isAllTimePositive ? 'text-green-400' : 'text-red-400'}`}>
                        {marketStats?.isAllTimePositive ? '▲' : '▼'} {marketStats?.allTimePercent}%
                        <span className="ml-2 opacity-30 text-[10px] font-normal text-white">(${marketStats?.allTimeDiff})</span>
                      </span>
                    </div>
                  </div>
                </div>
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis dataKey="date" stroke="rgba(255,255,255,0.2)" fontSize={9} tickLine={false} axisLine={false} dy={10} />
                      <YAxis stroke="rgba(255,255,255,0.2)" fontSize={9} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                      <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #c5a367', borderRadius: '0px', fontSize: '10px' }} itemStyle={{ color: '#c5a367' }} />
                      <Line type="monotone" dataKey="price" stroke="#c5a367" strokeWidth={2} dot={{ r: 3, fill: '#0a0908', stroke: '#c5a367', strokeWidth: 2 }} activeDot={{ r: 5 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {activeTab === 'tags' && (
              <div className="w-full h-full flex pt-4">
                <div className="flex-1 border-r border-white/5 pr-4">
                  <header className="flex flex-col mb-6">
                    <span className="text-[9px] uppercase tracking-[0.4em] text-red-400/60 mb-1">Redacted Markers</span>
                    <span className="text-[12px] font-mono tracking-widest text-white">Removed</span>
                  </header>
                  <div className="flex flex-col gap-4">
                    {tagEvolution.removed.length > 0 ? tagEvolution.removed.map(log => (
                      <div key={log.id} className="flex justify-between items-center opacity-60">
                        <span className="tag-item line-through border-red-900/40 text-red-200/50">{log.new_value}</span>
                        <span className="text-[8px] font-mono opacity-40">{new Date(log.event_date || log.created).getFullYear()}</span>
                      </div>
                    )) : (
                      <span className="text-[9px] uppercase tracking-widest opacity-20">No Historical Redactions</span>
                    )}
                  </div>
                </div>

                <div className="flex-1 pl-8">
                  <header className="flex flex-col mb-6">
                    <span className="text-[9px] uppercase tracking-[0.4em] text-green-400/60 mb-1">Post-Creation Associations</span>
                    <span className="text-[12px] font-mono tracking-widest text-white">Added</span>
                  </header>
                  <div className="flex flex-col gap-4">
                    {tagEvolution.added.length > 0 ? tagEvolution.added.map(log => (
                      <div key={log.id} className="flex justify-between items-center">
                        <span className="tag-item border-green-900/40 text-green-200/80">{log.new_value}</span>
                        <span className="text-[8px] font-mono opacity-40">{new Date(log.event_date || log.created).getFullYear()}</span>
                      </div>
                    )) : (
                      <span className="text-[9px] uppercase tracking-widest opacity-20">No Post-Creation Tags</span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}