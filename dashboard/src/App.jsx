import { useState, useEffect } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";
const catEmoji = { crime:"🚨", accident:"🚗", incendie:"🔥", medical:"🚑", autre:"📍" };
const sevColor = s => s >= 8 ? "#E24B4A" : s >= 5 ? "#EF9F27" : "#378ADD";

export default function App() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = () => {
    fetch(`${API_URL}/alerts?limit=30`)
      .then(r => r.json())
      .then(d => { setAlerts(d.alerts || []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchAlerts();
    const iv = setInterval(fetchAlerts, 30000);
    return () => clearInterval(iv);
  }, []);

  const updateStatus = (id, status) =>
    fetch(`${API_URL}/alerts/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    }).then(fetchAlerts);

  const stats = [
    { label: "Total", value: alerts.length, color: "#378ADD" },
    { label: "Urgents", value: alerts.filter(a => a.severity >= 8).length, color: "#E24B4A" },
    { label: "Fausses alertes", value: alerts.filter(a => a.is_fake).length, color: "#EF9F27" },
    { label: "Résolus", value: alerts.filter(a => a.status === "resolved").length, color: "#639922" }
  ];

  return (
    <div style={{fontFamily:"sans-serif",maxWidth:900,margin:"0 auto",
      padding:20,background:"#f8f8f6",minHeight:"100vh"}}>

      <header style={{display:"flex",alignItems:"center",gap:12,
        marginBottom:20,padding:"12px 20px",background:"white",
        borderRadius:12,boxShadow:"0 1px 3px rgba(0,0,0,0.08)"}}>
        <div style={{width:36,height:36,background:"#E24B4A",borderRadius:8,
          display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>
          🛡️
        </div>
        <div>
          <div style={{fontWeight:600,fontSize:16}}>SafeAlert Africa</div>
          <div style={{fontSize:12,color:"#888"}}>Dashboard · Mistral AI</div>
        </div>
        <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:6}}>
          <span style={{width:7,height:7,background:"#639922",
            borderRadius:"50%",display:"inline-block"}}></span>
          <span style={{fontSize:12,color:"#666"}}>Live</span>
        </div>
      </header>

      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",
        gap:10,marginBottom:16}}>
        {stats.map((s,i) => (
          <div key={i} style={{background:"white",borderRadius:8,
            padding:"12px 14px",boxShadow:"0 1px 3px rgba(0,0,0,0.06)"}}>
            <div style={{fontSize:22,fontWeight:600,color:s.color}}>{s.value}</div>
            <div style={{fontSize:11,color:"#888",marginTop:2}}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{background:"white",borderRadius:12,
        boxShadow:"0 1px 3px rgba(0,0,0,0.08)"}}>
        <div style={{padding:"12px 18px",borderBottom:"1px solid #f0f0f0",
          fontWeight:600,fontSize:13}}>
          Signalements en temps réel
        </div>
        {loading && (
          <div style={{padding:24,color:"#888",fontSize:13,textAlign:"center"}}>
            Chargement...
          </div>
        )}
        {alerts.map(a => (
          <div key={a.id} style={{padding:"10px 18px",
            borderBottom:"1px solid #f9f9f9",
            display:"flex",alignItems:"center",gap:10,
            opacity:a.is_fake ? 0.55 : 1}}>
            <span style={{fontSize:18}}>{catEmoji[a.category] || "📍"}</span>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:13,fontWeight:500,overflow:"hidden",
                textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                {a.summary}
              </div>
              <div style={{fontSize:11,color:"#888",marginTop:2}}>
                {a.city} · {new Date(a.created_at).toLocaleTimeString("fr")}
                {a.is_fake && (
                  <span style={{marginLeft:4,color:"#E24B4A",fontSize:10}}>
                    ⚠ fausse alerte
                  </span>
                )}
              </div>
            </div>
            <div style={{textAlign:"right",minWidth:40}}>
              <div style={{fontSize:15,fontWeight:700,color:sevColor(a.severity)}}>
                P{a.severity}
              </div>
              <div style={{fontSize:10,color:"#aaa"}}>{a.recommended_response}</div>
            </div>
            {a.status !== "resolved" && (
              <button onClick={() => updateStatus(a.id, "resolved")}
                style={{padding:"3px 10px",border:"1px solid #ddd",
                  borderRadius:6,fontSize:11,cursor:"pointer",background:"white"}}>
                ✓
              </button>
            )}
          </div>
        ))}
        {!loading && alerts.length === 0 && (
          <div style={{padding:40,textAlign:"center",color:"#999",fontSize:13}}>
            Aucun signalement pour le moment.
          </div>
        )}
      </div>
    </div>
  );
            }
