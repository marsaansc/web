import { useState } from "react";
import { Link } from "react-router-dom";
import aiImg from "../assets/AI_Edge_Board.JPG";
import fpgaImg from "../assets/FPGA.JPG";
import mcuImg from "../assets/Microcontroller.JPG";

const categoryList = [
  { name: "AI Edge Board", img: aiImg },
  { name: "FPGA Board", img: fpgaImg },
  { name: "Microcontroller", img: mcuImg },
  { name: "Memory" },
  { name: "Connectivity" },
];

const products = [
  {
    part: "FPGA-A7-35T",
    mfg: "AMD/Xilinx",
    specs: "Artix-7, DDR3",
    lead: "~150 days",
    category: "FPGA Board",
  },
  {
    part: "AI-EDGE-NANO",
    mfg: "NVIDIA",
    specs: "AI Inference Module",
    lead: "~60 days",
    category: "AI Edge Board",
  },
];

export default function Catalog() {
  const [search, setSearch] = useState("");
  const [activeCat, setActiveCat] = useState("");

  const filtered = products.filter(
    (p) =>
      p.part.toLowerCase().includes(search.toLowerCase()) &&
      (!activeCat || p.category === activeCat)
  );

  return (
    <div className="catalog-shell watermark">
      <aside className="catalog-filters">
        <h3>Filters</h3>

        <input
          placeholder="Search parts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <ul className="category-picker">
          {categoryList.map((c) => (
            <li
              key={c.name}
              className={`category-item ${activeCat === c.name ? "active" : ""}`}
              onClick={() => setActiveCat(activeCat === c.name ? "" : c.name)}
            >
              {c.img && <img src={c.img} alt={c.name} />}
              <span>{c.name}</span>
            </li>
          ))}
        </ul>
      </aside>

      <main className="catalog-results">
        <div className="catalog-topbar">
          <Link className="btn primary" to="/rfq">Upload BOM</Link>
        </div>

        <table className="table-compact">
          <thead>
            <tr>
              <th>Part</th>
              <th>Manufacturer</th>
              <th>Key Specs</th>
              <th>Lead Time</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.part}>
                <td>{p.part}</td>
                <td>{p.mfg}</td>
                <td>{p.specs}</td>
                <td>{p.lead}</td>
                <td>
                  <Link to={`/product/${p.part}`} className="btn">View</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </div>
  );
}
