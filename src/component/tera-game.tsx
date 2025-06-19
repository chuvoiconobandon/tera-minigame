import { useState } from "react";
import * as XLSX from "xlsx";

const checklistItems: string[] = [
  "Tham gia sự kiện sinh nhật công ty",
  "Chạy deadline banh nóc cùng đồng đội",
  "Gửi lời chúc mừng sinh nhật Teracom 4 tuổi",
  "Làm việc tại Teracom hơn 1 năm",
  "Checkin tại Standee sinh nhật",
  "Tham gia Teambuilding ít nhất 1 lần",
  "Tham gia ít nhất 1 minigame sinh nhật",
  "Tham gia All Hands Meeting",
  "Thay frame avatar Facebook",
  "Nạp năng lượng với trà sữa hoặc đồ ăn cùng đồng đội trong giờ làm",
  "Từng là 'nhân vật' ít nhất 1 lần trong bài đăng trên các Fanpage công ty",
  "Từng ghi danh vào 'bảng vàng' đi muộn"
];

interface Participant {
  name: string;
  position: string;
  checklist: string;
  luckyNumber: number;
  timestamp: string;
}

export default function TeraCheckMiniGame() {
  const [name, setName] = useState<string>("");
  const [position, setPosition] = useState<string>("");
  const [checked, setChecked] = useState<string[]>([]);
  const [luckyNumber, setLuckyNumber] = useState<number | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);

  const handleCheck = (item: string) => {
    setChecked(prev =>
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    );
  };

  const generateLuckyNumber = () => {
    const number = Math.floor(1000 + Math.random() * 9000);
    setLuckyNumber(number);

    const newParticipant: Participant = {
      name,
      position,
      checklist: checked.join(", "),
      luckyNumber: number,
      timestamp: new Date().toLocaleString()
    };

    setParticipants(prev => [...prev, newParticipant]);
  };

  const downloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(participants);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Participants");
    XLSX.writeFile(workbook, "tera_check_participants.xlsx");
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-10">
        <h2 className="text-3xl font-bold text-center text-blue-600">TERA-CHECK 🎉</h2>
        <p className="text-center text-gray-600 mb-6">Sinh nhật 4 tuổi đã làm gì?</p>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Họ tên"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <input
            type="text"
            placeholder="Vị trí công việc"
            value={position}
            onChange={e => setPosition(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[300px] overflow-y-auto">
          {checklistItems.map((item, index) => (
            <label
              key={index}
              className="flex items-start gap-2 text-sm text-gray-700"
            >
              <input
                type="checkbox"
                checked={checked.includes(item)}
                onChange={() => handleCheck(item)}
                className="mt-1"
              />
              <p className="text-left">{item}</p>
            </label>
          ))}
        </div>

        <button
          onClick={generateLuckyNumber}
          className="w-full mt-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition"
        >
          🌟 Quay số may mắn
        </button>

        {luckyNumber && (
          <div className="text-center text-2xl font-bold text-green-600 mt-4">
            🏻✨ Số may mắn của bạn là: {luckyNumber}
          </div>
        )}

        {participants.length > 0 && (
          <button
            onClick={downloadExcel}
            className="w-full mt-4 py-3 bg-gray-500 text-white font-semibold rounded-xl hover:bg-gray-600 transition"
          >
            📅 Tải danh sách tham gia (.xlsx)
          </button>
        )}
      </div>
    </div>
  );
}