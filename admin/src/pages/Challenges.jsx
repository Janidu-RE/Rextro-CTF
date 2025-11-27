import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Terminal, Shield, Cpu, Lock, FileCode } from 'lucide-react';

const Challenges = () => {
  const navigate = useNavigate();
  
  // Verify player session exists
  const [player] = useState(() => {
    const saved = localStorage.getItem('ctf_player');
    return saved ? JSON.parse(saved) : null;
  });

  if (!player) {
    navigate('/player');
    return null;
  }

  const challenges = [
    {
      id: 1,
      title: "Binary Exploitation",
      description: "Analyze the compiled binary to find the buffer overflow vulnerability and inject your shellcode.",
      icon: <Terminal size={48} className="text-blue-400" />,
      color: "from-blue-900/40 to-blue-600/10",
      borderColor: "border-blue-500/50",
      link: "#binary-challenge"
    },
    {
      id: 2,
      title: "Web Security",
      description: "Infiltrate the secure admin panel by exploiting a SQL injection flaw in the login query.",
      icon: <Shield size={48} className="text-green-400" />,
      color: "from-green-900/40 to-green-600/10",
      borderColor: "border-green-500/50",
      link: "#web-challenge"
    },
    {
      id: 3,
      title: "Digital Forensics",
      description: "Recover the deleted flag hidden within the corrupted memory dump of the suspect's machine.",
      icon: <FileCode size={48} className="text-purple-400" />,
      color: "from-purple-900/40 to-purple-600/10",
      borderColor: "border-purple-500/50",
      link: "#forensics-challenge"
    },
    {
      id: 4,
      title: "Cryptography",
      description: "Decrypt the intercepted communications encrypted with a custom RSA implementation.",
      icon: <Lock size={48} className="text-yellow-400" />,
      color: "from-yellow-900/40 to-yellow-600/10",
      borderColor: "border-yellow-500/50",
      link: "#crypto-challenge"
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white font-sans relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-black to-black z-0"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-800/10 via-black to-black pointer-events-none"></div>

      {/* Header */}
      <header className="bg-gray-900/80 backdrop-blur-md border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/player')}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={20} />
              <span className="hidden sm:inline">Back to Game</span>
            </button>
            <div className="h-6 w-px bg-gray-700 mx-2"></div>
            <h1 className="text-xl font-bold tracking-wider text-white uppercase">Mission Directives</h1>
          </div>
          <div className="font-mono text-sm text-ctf-red-500 animate-pulse">
            ACCESS LEVEL: GRANTED
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {challenges.map((challenge) => (
            <div 
              key={challenge.id}
              className={`
                relative group overflow-hidden rounded-2xl border ${challenge.borderColor} 
                bg-gray-900/50 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl
              `}
            >
              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${challenge.color} opacity-20 group-hover:opacity-30 transition-opacity`}></div>
              
              <div className="p-8 relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <div className="p-4 bg-black/50 rounded-xl border border-white/10 shadow-inner group-hover:border-white/20 transition-colors">
                    {challenge.icon}
                  </div>
                  <a 
                    href={challenge.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white/5 hover:bg-white/10 p-2 rounded-lg text-gray-400 hover:text-white transition-colors"
                  >
                    <ExternalLink size={20} />
                  </a>
                </div>

                <h3 className="text-2xl font-bold text-white mb-3 tracking-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-400 transition-all">
                  {challenge.title}
                </h3>
                
                <p className="text-gray-400 leading-relaxed mb-6 min-h-[3rem]">
                  {challenge.description}
                </p>

                <a 
                  href={challenge.link}
                  className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-white/70 hover:text-white border-b border-transparent hover:border-ctf-red-500 transition-all pb-1"
                >
                  Access Material <ArrowLeft className="rotate-180" size={14} />
                </a>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Challenges;