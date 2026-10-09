import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

function getServiceClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function reservePhotoCredit(studentId: string): Promise<string> {
  const supabase = getServiceClient();
  const { data, error } = await supabase.rpc("reserve_photo_credit", {
    p_student_id: studentId,
  });

  if (error) {
    if (error.code === "P0001") {
      const err = new Error("insufficient_credits") as Error & { code: string };
      err.code = "insufficient_credits";
      throw err;
    }
    throw error;
  }

  return data as string;
}

export async function settlePhotoCredit(jobId: string): Promise<void> {
  const supabase = getServiceClient();
  const { error } = await supabase.rpc("settle_photo_credit", {
    p_job_id: jobId,
  });

  if (error) {
    if (error.code === "P0002") {
      const err = new Error("job_not_found_or_not_pending") as Error & { code: string };
      err.code = "job_not_found_or_not_pending";
      throw err;
    }
    throw error;
  }
}
