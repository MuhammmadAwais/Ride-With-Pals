import {
  Plus,
  TrendingUp,
  Award,
  Zap,
  BarChart3,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { motion, type Variants } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DataTable from "@/components/ui/DataTable";
import type { Column } from "@/components/ui/DataTable";
import { useTableSort } from "@/hooks/useTableSort";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const ManageClub = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const navigate = useNavigate();

  // Retrieve values from LocalStorage (updates dynamically if edited in EditClub)
  const updatedCycRockName = localStorage.getItem("clubName");
 

  const allClubs = [
    {
      name: "Track Wolf",
      img: "/Images/HikingPicture.jpg",
      logo: "/Images/HikingPicture.jpg",
      sub: "FOUNDED 2021 • TECHNICAL",
      owner: "Brooklyn Simmons",
      avatar: "BS",
      count: "4,822",
      trend: "+2.4%",
      rank: "#42 ↑",
    },
    {
      name: updatedCycRockName || "Cyc Rock Club",
      img: "/Images/CyclingPicture.jpg",
      logo: "/Images/CyclingPicture.jpg",
      sub: "FOUNDED 2019 • EXTREME",
      owner: "Jerome Steward",
      avatar: "JS",
      count: "3,105",
      trend: "Steady",
      rank: "#118 -",
    },
    {
      name: "Night Ghost",
      img: "/Images/Girlmage2.png",
      logo: "/Images/Girlmage2.png",
      sub: "FOUNDED 2023 • STEALTH",
      owner: "Leslie Murphy",
      avatar: "LM",
      count: "6,277",
      trend: "+4.8%",
      rank: "#12 ↑",
    },
    {
      name: "Neon Riders",
      img: "/Images/Girlmage3.png",
      logo: "/Images/Girlmage3.png",
      sub: "FOUNDED 2022 • URBAN",
      owner: "Alex Rivera",
      avatar: "AR",
      count: "2,940",
      trend: "+1.2%",
      rank: "#88 ↑",
    },
    {
      name: "Iron Grip",
      img: "/Images/Girlmage4.png",
      logo: "/Images/Girlmage4.png",
      sub: "FOUNDED 2020 • POWER",
      owner: "Sam Taylor",
      avatar: "ST",
      count: "5,100",
      trend: "-0.5%",
      rank: "#55 ↓",
    },
    {
      name: "Sky Dwellers",
      img: "/Images/Girlmage5.png",
      logo: "/Images/Girlmage5.png",
      sub: "FOUNDED 2024 • AERIAL",
      owner: "Jordan Lee",
      avatar: "JL",
      count: "1,200",
      trend: "+10%",
      rank: "#205 ↑",
    },
    {
      name: "Deep Sea",
      img: "/Images/Girlmage6.png",
      logo: "/Images/Girlmage6.png",
      sub: "FOUNDED 2018 • MARINE",
      owner: "Casey Smith",
      avatar: "CS",
      count: "4,300",
      trend: "+3.1%",
      rank: "#60 ↑",
    },
    {
      name: "Volt Runners",
      img: "/Images/Girlmage7.png",
      logo: "/Images/Girlmage7.png",
      sub: "FOUNDED 2021 • SPEED",
      owner: "Taylor Reed",
      avatar: "TR",
      count: "3,890",
      trend: "Steady",
      rank: "#92 -",
    },
    {
      name: "Peak Climbers",
      img: "/Images/Girlmage8.png",
      logo: "/Images/Girlmage8.png",
      sub: "FOUNDED 2019 • ALPINIST",
      owner: "Morgan Hill",
      avatar: "MH",
      count: "7,450",
      trend: "+5.2%",
      rank: "#8 ↑",
    },
    {
      name: "Core Kinetic",
      img: "/Images/GrilImage11.png",
      logo: "/Images/GrilImage11.png",
      sub: "FOUNDED 2023 • AGILITY",
      owner: "Riley Quinn",
      avatar: "RQ",
      count: "2,100",
      trend: "+0.8%",
      rank: "#150 ↑",
    },
  ];

  const { items: sortedClubs, requestSort, sortConfig } = useTableSort(allClubs);

  const currentClubs = sortedClubs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const columns: Column<typeof allClubs[0]>[] = [
    {
      key: 'name',
      label: 'Club Information',
      sortable: true,
      render: (club) => (
        <div className="flex items-center gap-4">
          <img
            src={club.logo}
            alt={club.name}
            className="w-12 h-12 bg-hover border border-border rounded object-cover"
          />
          <div>
            <h3 className="font-bold text-sm">{club.name}</h3>
            <p className="text-[10px] text-gray-500 uppercase font-bold">
              {club.sub}
            </p>
          </div>
        </div>
      )
    },
    {
      key: 'owner',
      label: 'Owner',
      sortable: true,
      render: (club) => (
        <div className="text-sm flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-orange-900/30 flex items-center justify-center text-[10px] font-bold">
            {club.avatar}
          </div>
          {club.owner}
        </div>
      )
    },
    {
      key: 'count',
      label: 'Member Count',
      sortable: true,
      render: (club) => (
        <div className="text-sm font-bold">
          {club.count}
          <p className="text-[10px] text-green-500 font-normal">
            {club.trend}
          </p>
        </div>
      )
    },
    {
      key: 'rank',
      label: 'Global Rank',
      sortable: true,
      render: (club) => (
        <div className="text-sm font-bold text-[#EB712B]">
          {club.rank}
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: () => (
        <span className="flex items-center gap-1.5 px-2 py-1 bg-green-900/20 text-green-500 text-[10px] font-bold rounded border border-green-900/30 w-fit">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>{" "}
          ACTIVE
        </span>
      )
    },
    {
      key: 'rank', // just a key, rendered completely by render fn
      label: 'Actions',
      headerClass: 'text-right',
      cellClass: 'text-right',
      render: (club) => (
        <button
          onClick={() => {
            localStorage.setItem("selectedClubBanner", club.img);
            localStorage.setItem("selectedClubLogo", club.logo);
            localStorage.setItem("selectedClubName", club.name);
            navigate("/manage-club-home");
          }}
          className="px-5 py-2.5 bg-hover border border-border rounded-lg text-[10px] font-bold tracking-wider text-gray-300 hover:bg-[#222] hover:text-white hover:border-[#EB712B]/50 transition-all duration-300 cursor-pointer inline-block"
        >
          MANAGE
        </button>
      )
    }
  ];

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="text-text-main p-8 font-sans overflow-x-hidden"
    >
      {/* Hide Scrollbars Global Style */}
      <style>{`
        ::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div className="flex items-center gap-4">
          <a
            href="/profile"
            className="p-2 bg-[#222] rounded-full hover:bg-[#333] transition border border-border"
          >
            <ArrowLeft size={24} />
          </a>
          <div>
            <h1 className="text-3xl font-bold mb-1 text-text-main">MANAGE CLUBS</h1>
            <p className="text-text-muted text-sm">
              High-performance oversight for your athletic organizations.
            </p>
          </div>
        </div>
        <button className="bg-[#EB712B] flex items-center gap-2 px-6 py-2 rounded text-sm font-bold hover:bg-orange-600 transition cursor-pointer">
          <Plus size={18} /> Register New Club
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          {
            label: "ACTIVE MEMBERS",
            value: "14,204",
            sub: "+12% from last cycle",
            icon: TrendingUp,
            color: "text-green-500",
          },
          {
            label: "GLOBAL RANK AVG",
            value: "#42",
            sub: "ELITE TIER STATUS",
            icon: Award,
            color: "text-orange-500",
          },
          {
            label: "AVG ENGAGEMENT",
            value: "84.2%",
            sub: "High Intensity Threshold",
            icon: Zap,
            color: "text-orange-500",
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="bg-surface p-6 border border-border hover:border-[#EB712B]/50 transition-all duration-300 flex flex-col justify-between"
          >
            <div className="flex justify-between items-start mb-4">
              <p className="text-[23px] text-text-muted font-bold uppercase tracking-wider">
                {stat.label}
              </p>
              <stat.icon size={35} className="text-text-muted opacity-60" />
            </div>
            <div>
              <p className="text-4xl font-bold mb-1">{stat.value}</p>
              <p className={`text-[15px] font-bold ${stat.color}`}>
                {stat.sub}
              </p>
            </div>
          </div>
        ))}
        <div className="bg-[#EB712B]/5 p-6 border border-[#EB712B]/20 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider">
              GROWTH FORECAST
            </p>
            <BarChart3 size={16} className="text-[#EB712B]" />
          </div>
          <div>
            <p className="text-xl font-bold mb-1 leading-tight text-text-main">
              Projected +2,500
              <br />
              members
            </p>
            <div className="mt-4 w-full h-1 bg-hover rounded-full overflow-hidden">
              <div className="w-3/4 h-full bg-[#EB712B]" />
            </div>
          </div>
        </div>
      </div>

      {/* Directory Table */}
      <div className="mb-8 overflow-hidden">
        <DataTable data={currentClubs} columns={columns} sortConfig={sortConfig} onRequestSort={requestSort} />
        {/* Pagination */}
        <div className="p-4 flex justify-between items-center text-[10px] font-bold uppercase text-text-muted bg-surface border border-border border-t-0 rounded-b-xl">
          <p>Page {currentPage} of 2</p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="p-2 border border-border rounded hover:bg-hover disabled:opacity-20 cursor-pointer text-text-main"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setCurrentPage(2)}
              disabled={currentPage === 2}
              className="p-2 border border-border rounded hover:bg-hover disabled:opacity-20 cursor-pointer text-text-main"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Intelligence & Standing Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        <div className="bg-surface p-10 border border-border border-l-4 border-l-[#EB712B]">
          <div className="flex gap-6 items-start">
            <div className="p-4 bg-hover rounded-lg h-fit border border-border">
              <TrendingUp className="text-[#EB712B]" size={32} />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-3 text-text-main">Club Intelligence</h3>
              <p className="text-text-muted">
                Your managed entities have maintained a{" "}
                <span className="text-[#EB712B] font-bold">
                  98% technical compliance
                </span>{" "}
                rate this fiscal quarter. System analytics suggest no hardware
                interventions required for the next 45 days based on current
                intensity trends.
              </p>
            </div>
          </div>
        </div>
        <div className="bg-surface p-10 border border-border border-l-4 border-l-emerald-600">
          <div className="flex gap-6 items-start">
            <div className="p-4 bg-hover rounded-lg h-fit border border-border">
              <Award className="text-emerald-500" size={32} />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-3 text-text-main">Global Standing</h3>
              <p className="text-text-muted">
                Elite status verified across all portfolios. Your operational
                efficiency is currently ranked in the top{" "}
                <span className="text-emerald-600 font-bold">
                  5% of gear management professionals
                </span>{" "}
                worldwide within the Technical Athletics sector.
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ManageClub;
