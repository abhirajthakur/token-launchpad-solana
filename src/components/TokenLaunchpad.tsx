import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createInitializeMint2Instruction,
  getMinimumBalanceForRentExemptMint,
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import "@solana/wallet-adapter-react-ui/styles.css";
import { Keypair, SystemProgram, Transaction } from "@solana/web3.js";
import { Coins, Layers, Tag, Users } from "lucide-react";
import { useState } from "react";
import { toast, Toaster } from "sonner";

function TokenLaunchpad() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [tokenName, setTokenName] = useState<string>("");
  const [tokenSymbol, setTokenSymbol] = useState<string>("");
  const [tokenSupply, setTokenSupply] = useState<string>("");
  const [decimals, setDecimals] = useState<string>("");
  const [isCreating, setIsCreating] = useState<boolean>(false);

  const handleCreateToken = async () => {
    if (!wallet.connected) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (parseInt(tokenSupply) <= 0) {
      toast.error("Total supply must be greater than ZERO.");
      return;
    }

    if (parseInt(decimals) < 0) {
      toast.error("Decimals should be greater than or equal to ZERO.");
      return;
    }

    setIsCreating(true);

    try {
      const lamports = await getMinimumBalanceForRentExemptMint(connection);
      const mintKeypair = Keypair.generate();

      const transaction = new Transaction().add(
        SystemProgram.createAccount({
          fromPubkey: wallet.publicKey!,
          newAccountPubkey: mintKeypair.publicKey,
          space: MINT_SIZE,
          lamports,
          programId: TOKEN_PROGRAM_ID,
        }),
        createInitializeMint2Instruction(
          mintKeypair.publicKey,
          Number(decimals),
          wallet.publicKey!,
          wallet.publicKey,
          TOKEN_PROGRAM_ID,
        ),
      );

      transaction.recentBlockhash = (
        await connection.getLatestBlockhash()
      ).blockhash;
      transaction.feePayer = wallet.publicKey!;

      transaction.partialSign(mintKeypair);
      const txHash = await wallet.sendTransaction(transaction, connection);

      toast.success(
        <div className="flex flex-col">
          <span>Token created successfully!</span>
          <span className="opacity-80">Name: {tokenName}</span>
          <span className="opacity-80">Symbol: {tokenSymbol}</span>
          <span className="opacity-80">
            View your transaction{" "}
            <a
              href={`https://explorer.solana.com/tx/${txHash}?cluster=devnet`}
              className="font-semibold"
              target="_blank"
            >
              here
            </a>
          </span>
        </div>,
        { duration: 5000 },
      );
    } catch (e) {
      toast.error("Failed to create token. Please try again.");
      console.log(e);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center p-4">
      <Toaster position="top-right" expand={true} richColors />
      <Card className="w-full max-w-md bg-white shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Create Solana Token
          </CardTitle>
          <CardDescription className="text-center">
            Launch your own token on the Solana blockchain
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-center">
              <WalletMultiButton className="bg-purple-500 hover:bg-purple-600" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tokenName">
                <Tag className="inline mr-2 text-purple-500" />
                Token Name
              </Label>
              <Input
                id="tokenName"
                placeholder="e.g., My Awesome Token"
                value={tokenName}
                onChange={(e) => setTokenName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tokenSymbol">
                <Coins className="inline mr-2 text-blue-500" />
                Token Symbol
              </Label>
              <Input
                id="tokenSymbol"
                placeholder="e.g., MAT"
                value={tokenSymbol}
                onChange={(e) => setTokenSymbol(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tokenSupply">
                <Users className="inline mr-2 text-green-500" />
                Total Supply
              </Label>
              <Input
                id="tokenSupply"
                type="number"
                placeholder="e.g., 1000000"
                value={tokenSupply}
                onChange={(e) => setTokenSupply(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="decimals">
                <Layers className="inline mr-2 text-yellow-500" />
                Decimals
              </Label>
              <Input
                id="decimals"
                type="number"
                placeholder="e.g., 9"
                value={decimals}
                onChange={(e) => setDecimals(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
            onClick={handleCreateToken}
            disabled={
              !wallet.connected ||
              !tokenName ||
              !tokenSymbol ||
              !tokenSupply ||
              !decimals ||
              isCreating
            }
          >
            {isCreating ? "Creating Token..." : "Create Token"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default TokenLaunchpad;
