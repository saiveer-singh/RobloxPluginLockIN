import React, { useState } from 'react';
import { 
  Folder, File, ChevronRight, ChevronDown, Box, Code, Zap, Image as ImageIcon, 
  Type, Globe, Users, Sun, Database, Server, HardDrive, LayoutTemplate, 
  Briefcase, User, Flag, Music, MessageSquare, Boxes, FileCode, Radio, Link, 
  Monitor, Square, Scroll, Lightbulb, Sparkles, Activity, Layers, ArrowDownToLine,
  RefreshCw, Hash, Variable, ToggleLeft, Anchor, Link2, Play, Settings, 
  Cloud, Map, Eye, MousePointer, Gamepad2, Keyboard, Smartphone, Package,
  AlertCircle, CheckCircle, HelpCircle, Info, Terminal, Command, 
  AlignLeft, AlignCenter, AlignRight, Grid, List, Columns, 
  CreditCard, DollarSign, ShoppingBag, Tag, Video, Camera, Aperture,
  Component, Cpu, CircuitBoard, Network, Wifi, Bluetooth,
  Lock, Unlock, Shield, Key, EyeOff, Bell, BellOff,
  Calendar, Clock, Timer, Watch, MapPin, Navigation,
  CloudRain, CloudSnow, CloudLightning, CloudDrizzle,
  Thermometer, Droplets, Wind, Umbrella,
  Speaker, Mic, Volume2, VolumeX, Headphones,
  Book, Bookmark, FileText, FilePlus, FileMinus
} from 'lucide-react';
import { useProject, ProjectAsset } from '@/lib/project-context';

// Fallback icons for those not imported/mapped
// Note: Some icons above might not be imported to save space/complexity, 
// so we use this component to safely render with fallbacks.
const Flask = ({ className }: { className?: string }) => <Terminal className={className} />;
const Hammer = ({ className }: { className?: string }) => <Briefcase className={className} />;
const HardHat = ({ className }: { className?: string }) => <Briefcase className={className} />;
const Triangle = ({ className }: { className?: string }) => <Box className={className} />;
const Car = ({ className }: { className?: string }) => <Box className={className} />;
const Armchair = ({ className }: { className?: string }) => <Box className={className} />;
const AppWindow = ({ className }: { className?: string }) => <Monitor className={className} />;
const Maximize = ({ className }: { className?: string }) => <Square className={className} />;
const Circle = ({ className }: { className?: string }) => <Box className={className} />;
const Palette = ({ className }: { className?: string }) => <Zap className={className} />;
const Move = ({ className }: { className?: string }) => <Activity className={className} />;
const Move3d = ({ className }: { className?: string }) => <Activity className={className} />;
const RotateCw = ({ className }: { className?: string }) => <Activity className={className} />;
const Flame = ({ className }: { className?: string }) => <Zap className={className} />;
const Bomb = ({ className }: { className?: string }) => <Zap className={className} />;
const PersonStanding = ({ className }: { className?: string }) => <User className={className} />;
const Hand = ({ className }: { className?: string }) => <MousePointer className={className} />;
const Shirt = ({ className }: { className?: string }) => <User className={className} />;
const Scissors = ({ className }: { className?: string }) => <User className={className} />;

// Comprehensive mapping of Roblox Classes to Lucide Icons
const CLASS_ICON_MAP: Record<string, React.ElementType> = {
  // Services
  workspace: Globe,
  players: Users,
  lighting: Sun,
  materialservice: Component,
  replicatedfirst: ArrowDownToLine,
  replicatedstorage: Layers,
  serverscriptservice: Server,
  serverstorage: HardDrive,
  startergui: LayoutTemplate,
  starterpack: Briefcase,
  starterplayer: User,
  teams: Flag,
  soundservice: Music,
  chat: MessageSquare,
  textchatservice: MessageSquare,
  voicechatservice: Mic,
  localizationservice: Globe,
  testservice: Flask,
  
  // Basic Containers
  folder: Folder,
  model: Boxes,
  tool: Hammer,
  accessory: ShoppingBag,
  hat: HardHat,
  
  // 3D Objects
  part: Box,
  meshpart: Box,
  unionoperation: Component,
  spawnlocation: MapPin,
  trusspart: Grid,
  wedgepart: Triangle,
  cornerwedgepart: Triangle,
  vehicle: Car,
  seat: Armchair,
  
  // Scripts
  script: FileCode, // Server script (handled specially for color)
  localscript: FileCode, // Local script
  modulescript: FileCode, // Module script
  
  // GUI
  screengui: Monitor,
  surfacegui: AppWindow,
  billboardgui: Square,
  frame: Square,
  scrollingframe: Scroll,
  imagelabel: ImageIcon,
  imagebutton: ImageIcon,
  textlabel: Type,
  textbutton: Type,
  textbox: Type,
  videoframe: Video,
  viewportframe: Camera,
  uigridlayout: Grid,
  uilistlayout: List,
  uipadding: Maximize,
  uicorner: Circle,
  uistroke: Square,
  uiaspectratioconstraint: Maximize,
  
  // Values
  stringvalue: Type,
  intvalue: Hash,
  numbervalue: Hash,
  boolvalue: ToggleLeft,
  objectvalue: Box,
  color3value: Palette,
  vector3value: Move,
  cframevalue: Move3d,
  brickcolorvalue: Palette,
  rayvalue: Move,
  
  // Physics & Constraints
  attachment: Anchor,
  weld: Link2,
  motor6d: Link2,
  hingeconstraint: Link2,
  ballsocketconstraint: Circle,
  ropeconstraint: Link,
  rodconstraint: Link,
  springconstraint: Activity,
  torsionspringconstraint: Activity,
  prismaticconstraint: AlignCenter,
  cylindricalconstraint: AlignCenter,
  alignposition: Move,
  alignorientation: RotateCw,
  
  // Lighting & Effects
  sky: Cloud,
  atmosphere: Cloud,
  clouds: Cloud,
  bloom: Sun,
  blur: EyeOff,
  colorcorrection: Palette,
  sunrays: Sun,
  pointlight: Lightbulb,
  spotlight: Lightbulb,
  surfacelight: Lightbulb,
  particleemitter: Sparkles,
  trail: Activity,
  beam: Activity,
  fire: Flame,
  smoke: Cloud,
  sparkles: Sparkles,
  explosion: Bomb,
  
  // Animation
  animation: Play,
  animationcontroller: Gamepad2,
  animator: PersonStanding,
  keyframesequence: Film,
  
  // Audio
  sound: Speaker,
  soundgroup: Folder,
  chorussoundeffect: Music,
  compressorsoundeffect: Music,
  distortionsoundeffect: Music,
  echoeffect: Music,
  equalizersoundeffect: Music,
  flangersoundeffect: Music,
  pitchshiftsoundeffect: Music,
  reverbsoundeffect: Music,
  tremolosoundeffect: Music,
  
  // Input
  clickdetector: MousePointer,
  proximityprompt: Hand,
  
  // Misc
  configuration: Settings,
  humanoid: User,
  bodycolors: Palette,
  shirt: Shirt,
  pants: Scissors, // Approximate
  decals: ImageIcon,
  texture: Grid,
};

const AssetIcon = ({ className }: { className: string }) => {
  const cls = className ? className.toLowerCase() : '';
  
  // Special Handling for Script Colors
  if (cls === 'script') return <FileCode className="w-4 h-4 text-gray-300" />; // Server: Grey
  if (cls === 'localscript') return <FileCode className="w-4 h-4 text-blue-400" />; // Client: Blue
  if (cls === 'modulescript') return <FileCode className="w-4 h-4 text-purple-400" />; // Module: Purple
  
  // Lookup in map
  const IconComponent = CLASS_ICON_MAP[cls] || File; // Default to File icon
  
  // Determine color based on category/type (heuristic)
  let colorClass = "text-gray-400";
  
  if (cls === 'folder') colorClass = "text-yellow-400 fill-yellow-400/20";
  else if (cls === 'workspace') colorClass = "text-blue-500";
  else if (cls === 'players' || cls === 'starterplayer' || cls === 'humanoid') colorClass = "text-green-500";
  else if (cls === 'lighting' || cls === 'pointlight' || cls === 'spotlight' || cls === 'surfacelight') colorClass = "text-yellow-300";
  else if (cls.includes('storage') || cls.includes('server')) colorClass = "text-blue-400";
  else if (cls.includes('starter')) colorClass = "text-purple-400";
  else if (cls === 'part' || cls === 'meshpart') colorClass = "text-white";
  else if (cls === 'model') colorClass = "text-white";
  else if (cls.includes('gui') || cls.includes('frame') || cls.includes('button') || cls.includes('label')) colorClass = "text-green-400";
  else if (cls.includes('value')) colorClass = "text-yellow-600";
  else if (cls.includes('constraint') || cls === 'attachment') colorClass = "text-orange-400";
  else if (cls === 'sound' || cls === 'soundservice') colorClass = "text-blue-300";
  
  return <IconComponent className={`w-4 h-4 ${colorClass}`} />;
};

const TreeNode = ({ node, depth = 0 }: { node: ProjectAsset; depth?: number }) => {
  const [isOpen, setIsOpen] = useState(true);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="select-none font-sans">
      <div 
        className="flex items-center gap-1.5 py-0.5 px-2 hover:bg-[#2a2d2e] cursor-pointer group transition-colors border-l-2 border-transparent hover:border-[#007acc]"
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={() => hasChildren && setIsOpen(!isOpen)}
      >
        {/* Arrow */}
        <span className={`text-gray-400 hover:text-white transition-colors flex-shrink-0 ${hasChildren ? '' : 'opacity-0'}`}>
           {isOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        </span>
        
        {/* Icon */}
        <div className="flex-shrink-0">
          <AssetIcon className={node.className} />
        </div>
        
        {/* Name */}
        <span className="text-[#cccccc] text-sm truncate group-hover:text-white">{node.name}</span>
      </div>
      
      {isOpen && hasChildren && (
        <div>
          {node.children.map(child => (
            <TreeNode key={child.id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

export function ProjectExplorer() {
  const { projectTree, clearProject, syncFromStudio } = useProject();
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = async () => {
    setIsSyncing(true);
    await syncFromStudio();
    setTimeout(() => setIsSyncing(false), 500);
  };

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] border-l border-[#3e3e42]">
      <div className="flex items-center justify-between px-3 py-2 bg-[#252526] border-b border-[#3e3e42]">
        <span className="text-xs font-bold text-[#cccccc] uppercase tracking-wider">Explorer</span>
        <div className="flex items-center gap-1">
          <button 
            onClick={handleSync}
            disabled={isSyncing}
            className="text-[10px] text-[#858585] hover:text-white px-2 py-0.5 rounded hover:bg-[#3e3e42] transition-colors disabled:opacity-50 flex items-center gap-1"
            title="Sync from Roblox Studio"
          >
            <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
            Sync
          </button>
          {projectTree.length > 0 && (
            <button 
              onClick={clearProject}
              className="text-[10px] text-[#858585] hover:text-white px-2 py-0.5 rounded hover:bg-[#3e3e42] transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto py-1 custom-scrollbar">
        {projectTree.length === 0 ? (
          <div className="p-4 text-center">
            <div className="text-[#858585] text-xs italic">
              Empty Project
            </div>
            <div className="mt-2 text-[10px] text-[#555555]">
              Generated assets will appear here
            </div>
          </div>
        ) : (
          projectTree.map(node => (
            <TreeNode key={node.id} node={node} />
          ))
        )}
      </div>
    </div>
  );
}
