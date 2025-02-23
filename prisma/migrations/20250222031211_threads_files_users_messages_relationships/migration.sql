-- CreateTable
CREATE TABLE "_FilesToThreads" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_FilesToThreads_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_FilesToThreads_B_index" ON "_FilesToThreads"("B");

-- AddForeignKey
ALTER TABLE "threads" ADD CONSTRAINT "threads_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FilesToThreads" ADD CONSTRAINT "_FilesToThreads_A_fkey" FOREIGN KEY ("A") REFERENCES "files"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FilesToThreads" ADD CONSTRAINT "_FilesToThreads_B_fkey" FOREIGN KEY ("B") REFERENCES "threads"("id") ON DELETE CASCADE ON UPDATE CASCADE;
