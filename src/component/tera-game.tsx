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

const TeraCheckMiniGame: React.FC = () => {
  const [name, setName] = useState<string>("");
  const [position, setPosition] = useState<string>("");
  const [checked, setChecked] = useState<string[]>([]);
  const [luckyNumber, setLuckyNumber] = useState<number | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const DO_POST_URL: string = "https://script.google.com/macros/s/AKfycbx4hsmwFKZD5FDnNNM1vqpWJsAZa-3srvt66F-mKEctqB59wqEFTHk2SpGjfK8igmg-Yg/exec";
  const DO_GET_URL: string = "https://script.google.com/macros/s/AKfycbyl-Pn1LE_nJTY4jTBCOt0P6pYJByTF--WbjHRecOBNywMqdspyBwJXJbhE7WRUNVDfzg/exec";

  const handleCheck = (item: string): void => {
    setChecked((prev) =>
        prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const saveToGoogleSheet = async (participant: Participant): Promise<void> => {
    try {
      await fetch(DO_POST_URL, {
        method: "POST",
        mode: "no-cors", // Google Apps Script yêu cầu no-cors
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: participant.name,
          position: participant.position,
          checklist: participant.checklist,
          luckyNumber: participant.luckyNumber,
          timestamp: participant.timestamp,
        }),
      });

      return;
    } catch (err: unknown) {
      throw new Error("Lỗi khi lưu vào Google Sheet: " + (err instanceof Error ? err.message : String(err)));
    }
  };

  const handleGenerateLuckyNumber = async (): Promise<void> => {
    if (!name || !position || checked.length === 0) {
      setError("Vui lòng nhập đầy đủ thông tin và chọn ít nhất một mục!");
      return;
    }

    setIsLoading(true);
    setError(null);

    const number: number = Math.floor(1000 + Math.random() * 9000);
    const newParticipant: Participant = {
      name,
      position,
      checklist: checked.join(", "),
      luckyNumber: number,
      timestamp: new Date().toLocaleString("vi-VN"),
    };

    try {
      // Lưu vào Google Sheet trước
      await saveToGoogleSheet(newParticipant);
      // Chỉ cập nhật state sau khi lưu thành công
      setLuckyNumber(number);
      setParticipants((prev) => [...prev, newParticipant]);
      setName("");
      setPosition("");
      setChecked([]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  };

  const downloadGoogleSheet = async (): Promise<void> => {
    try {
      const response = await fetch(DO_GET_URL);
      if (!response.ok) throw new Error("Lỗi khi tải Google Sheet");
      const data: Participant[] = await response.json();

      // Chuyển dữ liệu thành file Excel
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Participants");
      XLSX.writeFile(workbook, "tera_check_participants_from_google_sheet.xlsx");
    } catch (err: unknown) {
      setError(err instanceof Error ? "Lỗi khi tải Google Sheet: " + err.message : String(err));
    }
  };

  // const downloadLocalExcel = (): void => {
  //   const worksheet = XLSX.utils.json_to_sheet(participants);
  //   const workbook = XLSX.utils.book_new();
  //   XLSX.utils.book_append_sheet(workbook, worksheet, "Participants");
  //   XLSX.writeFile(workbook, "tera_check_participants_local.xlsx");
  // };

  return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-10">
          <h2 className="text-3xl font-bold text-center text-blue-600">TERA-CHECK 🎉</h2>
          <p className="text-center text-gray-600 mb-6">Sinh nhật 4 tuổi đã làm gì?</p>

          {error && (
              <div className="text-center text-red-600 mb-4">{error}</div>
          )}

          <div className="space-y-4">
            <input
                type="text"
                placeholder="Họ tên"
                value={name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

            <input
                type="text"
                placeholder="Vị trí công việc"
                value={position}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPosition(e.target.value)}
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
              onClick={handleGenerateLuckyNumber}
              disabled={isLoading}
              className={`w-full mt-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {isLoading ? "Đang xử lý..." : "🌟 Quay số may mắn"}
          </button>

          {luckyNumber && (
              <div className="text-center text-2xl font-bold text-green-600 mt-4">
                🏻✨ Số may mắn của bạn là: {luckyNumber}
              </div>
          )}

          {participants.length > 0 && (
              <div className="flex flex-col sm:flex-row gap-4 mt-4">
                {/*<button*/}
                {/*    onClick={downloadLocalExcel}*/}
                {/*    className="w-full py-3 bg-gray-500 text-white font-semibold rounded-xl hover:bg-gray-600 transition"*/}
                {/*>*/}
                {/*  📅 Tải danh sách cục bộ (.xlsx)*/}
                {/*</button>*/}
                <button
                    onClick={downloadGoogleSheet}
                    className="w-full py-3 bg-green-500 text-white font-semibold rounded-xl hover:bg-green-600 transition"
                >
                  📊 Tải từ Google Sheet (.xlsx)
                </button>
              </div>
          )}
        </div>
      </div>
  );
};

export default TeraCheckMiniGame;