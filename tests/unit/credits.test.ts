import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(),
}));

import { createClient } from "@supabase/supabase-js";
import { reservePhotoCredit, settlePhotoCredit } from "@/lib/credits";

const mockRpc = vi.fn();

beforeEach(() => {
  vi.mocked(createClient).mockReturnValue({
    rpc: mockRpc,
  } as ReturnType<typeof createClient>);
  mockRpc.mockReset();
});

describe("reservePhotoCredit", () => {
  it("returns a photo_job UUID on success", async () => {
    const jobId = "550e8400-e29b-41d4-a716-446655440000";
    mockRpc.mockResolvedValue({ data: jobId, error: null });

    const result = await reservePhotoCredit("student-uuid");

    expect(result).toBe(jobId);
    expect(mockRpc).toHaveBeenCalledWith("reserve_photo_credit", {
      p_student_id: "student-uuid",
    });
  });

  it("throws with code insufficient_credits when no credits remain", async () => {
    mockRpc.mockResolvedValue({
      data: null,
      error: { code: "P0001", message: "insufficient_credits" },
    });

    await expect(reservePhotoCredit("student-uuid")).rejects.toMatchObject({
      code: "insufficient_credits",
      message: "insufficient_credits",
    });
  });

  it("re-throws unexpected DB errors", async () => {
    mockRpc.mockResolvedValue({
      data: null,
      error: { code: "42P01", message: "relation does not exist" },
    });

    await expect(reservePhotoCredit("student-uuid")).rejects.toMatchObject({
      code: "42P01",
    });
  });
});

describe("settlePhotoCredit", () => {
  it("resolves without error on success", async () => {
    mockRpc.mockResolvedValue({ data: null, error: null });

    await expect(settlePhotoCredit("job-uuid")).resolves.toBeUndefined();
    expect(mockRpc).toHaveBeenCalledWith("settle_photo_credit", {
      p_job_id: "job-uuid",
    });
  });

  it("throws with code job_not_found_or_not_pending when job is already settled", async () => {
    mockRpc.mockResolvedValue({
      data: null,
      error: { code: "P0002", message: "job_not_found_or_not_pending" },
    });

    await expect(settlePhotoCredit("job-uuid")).rejects.toMatchObject({
      code: "job_not_found_or_not_pending",
    });
  });
});
