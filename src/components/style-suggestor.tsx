'use client';

import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Wand2, Upload, AlertCircle, Loader2 } from 'lucide-react';
import Image from 'next/image';
import {
  suggestBraidStyle,
  type StyleSuggestionOutput,
} from '@/ai/flows/style-suggestion-from-photo';
import { useToast } from '@/hooks/use-toast';
import { Badge } from './ui/badge';

export function StyleSuggestor() {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<StyleSuggestionOutput | null>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
      setResult(null);
      setError(null);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!file) {
      setError('Please upload a photo first.');
      return;
    }
    if (!preview) {
      setError('Could not read the file. Please try again.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const suggestion = await suggestBraidStyle({ photoDataUri: preview });
      setResult(suggestion);
    } catch (e: any) {
      console.error(e);
      setError('Failed to get suggestions. Please try again later.');
      toast({
        variant: 'destructive',
        title: 'An error occurred',
        description:
          e.message ||
          'There was a problem with the AI suggestion service.',
      });
    } finally {
      setLoading(false);
    }
  };
  
  const resetState = () => {
      setFile(null);
      setPreview(null);
      setLoading(false);
      setError(null);
      setResult(null);
  }

  return (
    <Sheet open={open} onOpenChange={(isOpen) => {
      if (!isOpen) resetState();
      setOpen(isOpen);
    }}>
      <SheetTrigger asChild>
        <Button variant="outline">
          <Wand2 className="mr-2 h-4 w-4" />
          AI Style Suggestor
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="font-headline text-2xl text-primary">
            AI Braid Style Suggestor
          </SheetTitle>
          <SheetDescription>
            Upload a photo of yourself and let our AI recommend the perfect
            braid styles for you.
          </SheetDescription>
        </SheetHeader>
        <div className="py-6">
          {!result && (
            <form onSubmit={handleSubmit}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-primary">
                    <Upload className="w-5 h-5 mr-2" /> Upload Your Photo
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="photo">Photo</Label>
                    <Input
                      id="photo"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      disabled={loading}
                    />
                  </div>
                  {preview && (
                    <div className="mt-4 relative w-full aspect-square rounded-md overflow-hidden border">
                      <Image
                        src={preview}
                        alt="Preview"
                        fill
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                  )}
                  {error && (
                    <div className="flex items-center text-destructive text-sm font-medium">
                      <AlertCircle className="w-4 h-4 mr-2" /> {error}
                    </div>
                  )}
                </CardContent>
              </Card>
              <Button type="submit" className="w-full mt-4" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  'Get Suggestions'
                )}
              </Button>
            </form>
          )}

          {loading && !result && (
             <Card className="mt-4">
                <CardHeader>
                    <CardTitle className="text-primary">Generating Suggestions...</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-center p-8">
                        <Loader2 className="w-12 h-12 text-foreground animate-spin" />
                    </div>
                    <p className="text-center text-muted-foreground">Our AI is analyzing your photo. This may take a moment.</p>
                </CardContent>
             </Card>
          )}

          {result && (
            <div className="mt-4 space-y-6 animate-in fade-in-50">
              <Card>
                <CardHeader>
                  <CardTitle className="font-headline text-xl text-primary">
                    Our Recommendations For You
                  </CardTitle>
                  <CardDescription>
                    Based on your photo, here are some styles we think you'll love.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <h4 className="font-semibold mb-3 text-primary">Suggested Styles:</h4>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {result.suggestedStyles.map(style => (
                      <Badge key={style} variant="secondary" className="text-sm py-1 px-3">
                        {style}
                      </Badge>
                    ))}
                  </div>

                  <h4 className="font-semibold mt-6 mb-3 text-primary">Stylist's Reasoning:</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {result.reasoning}
                  </p>
                </CardContent>
              </Card>
              <Button onClick={resetState} className="w-full" variant="outline">
                Try Another Photo
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
