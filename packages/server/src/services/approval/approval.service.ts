import path from "path";
import fs from "fs";
import { ApprovalItem, ApprovalItemSchema } from "@oomnieye/shared";

export class ApprovalService {
  private items: ApprovalItem[] = [];

  constructor() {
    this.loadData();
  }

  private loadData(): void {
    try {
      const filePath = path.resolve(__dirname, "../../data/approvalsQueue.json");
      const rawData = fs.readFileSync(filePath, "utf-8");
      const parsed = JSON.parse(rawData);

      if (Array.isArray(parsed)) {
        this.items = parsed.map((item) => ApprovalItemSchema.parse(item));
      } else {
        throw new Error("approvalsQueue.json must be an array of approval items");
      }
    } catch (err) {
      console.error("[ApprovalService] Failed to load approvalsQueue.json:", err);
      this.items = [];
    }
  }

  public getItems(): ApprovalItem[] {
    this.loadData();
    return this.items;
  }

  public getPendingItems(): ApprovalItem[] {
    this.loadData();
    return this.items.filter((item) => {
      const s = (item.status || "").toLowerCase();
      return !s.includes("completed") && !s.includes("approved") && !s.includes("rejected");
    });
  }

  public getItemById(id: string): ApprovalItem | undefined {
    this.loadData();
    return this.items.find((item) => item.id === id);
  }

  public getUrgentItems(): ApprovalItem[] {
    this.loadData();
    return this.getPendingItems().filter(
      (item) => item.urgent || item.type === "Video" || item.type === "PDF",
    );
  }
}

export const approvalService = new ApprovalService();
