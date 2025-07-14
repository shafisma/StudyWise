
'use client';

import { useState, useRef } from 'react';
import ReactFlow, { MiniMap, Controls, Background, type Node, type Edge, MarkerType, BackgroundVariant } from 'react-flow-renderer';
import { BrainCircuit, Loader2, Wand2, Upload, FileText, Youtube, Mic, ArrowLeft } from 'lucide-react';
import { analyzeContent, type AnalyzeContentOutput, type AnalyzeContentInput } from '@/ai/flows/analyze-content';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';


type InputMode = 'text' | 'file' | 'youtube' | 'audio';

const fileToDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    });
};

const mapDataToFlowElements = (data: AnalyzeContentOutput): { nodes: Node[], edges: Edge[] } => {
    const nodes: Node[] = data.concepts.map((concept, index) => ({
        id: concept.id,
        data: { label: (
            <div className="p-2 text-center">
                <div className="font-bold">{concept.name}</div>
                <div className="text-xs text-foreground/70">{concept.description}</div>
            </div>
        ) },
        position: { x: (index % 5) * 280, y: Math.floor(index / 5) * 180 },
        style: { 
            width: '220px',
            background: 'hsl(var(--card))',
            color: 'hsl(var(--card-foreground))',
            border: '1px solid hsl(var(--border))',
            borderRadius: 'var(--radius)',
        },
    }));

    const edges: Edge[] = data.relationships.map((edge) => ({
        id: `e-${edge.source}-${edge.target}-${edge.label}`,
        source: edge.source,
        target: edge.target,
        label: edge.label,
        animated: true,
        markerEnd: { type: MarkerType.ArrowClosed, color: 'hsl(var(--primary))' },
        style: {
            stroke: 'hsl(var(--primary))',
            strokeWidth: 2,
        },
        labelStyle: { fill: 'hsl(var(--primary))', fontWeight: 'bold' },
    }));

    return { nodes, edges };
};


export default function ConceptMapPage() {
    const [inputMode, setInputMode] = useState<InputMode>('text');
    const [inputText, setInputText] = useState('');
    const [youtubeUrl, setYoutubeUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [flowData, setFlowData] = useState<{ nodes: Node[], edges: Edge[] } | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    const handleGenerate = async () => {
        let input: AnalyzeContentInput = {};

        switch (inputMode) {
            case 'text':
                if (!inputText.trim()) {
                    toast({ variant: 'destructive', title: 'Text is required.' });
                    return;
                }
                input.text = inputText;
                break;
            case 'youtube':
                if (!youtubeUrl.trim()) {
                    toast({ variant: 'destructive', title: 'YouTube URL is required.' });
                    return;
                }
                input.youtubeUrl = youtubeUrl;
                break;
            case 'file':
                const file = fileInputRef.current?.files?.[0];
                if (!file) {
                    toast({ variant: 'destructive', title: 'A file is required.' });
                    return;
                }
                 if (['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
                    input.imageDataUri = await fileToDataURL(file);
                } else {
                     toast({
                        variant: 'destructive',
                        title: 'Unsupported File Type',
                        description: 'Please upload a text, image, or YouTube URL.',
                    });
                    return;
                }
                break;
             case 'audio':
                 toast({
                    variant: 'destructive',
                    title: 'Coming Soon!',
                    description: 'Audio input processing is not yet implemented.',
                });
                return;

        }

        setIsLoading(true);
        setFlowData(null);

        try {
            const result = await analyzeContent(input);
            if (!result || !result.concepts || result.concepts.length === 0) {
              toast({
                variant: 'destructive',
                title: 'Analysis Failed',
                description: 'Could not extract any concepts. Try different content or be more specific.',
              });
              setFlowData({nodes: [], edges: []}); // Set to empty to clear placeholder
            } else {
                const { nodes, edges } = mapDataToFlowElements(result);
                setFlowData({ nodes, edges });
            }
        } catch (error) {
            console.error('Error generating concept map:', error);
            toast({
                variant: 'destructive',
                title: 'Generation Failed',
                description: 'An error occurred while analyzing your content.',
            });
        } finally {
            setIsLoading(false);
        }
    };
    
    const renderInputForm = () => (
        <div className="max-w-2xl mx-auto">
            <Card>
                <Tabs
                    value={inputMode}
                    onValueChange={(value) => setInputMode(value as InputMode)}
                    className="w-full"
                >
                    <CardHeader>
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="text"><FileText className="mr-2" />Text</TabsTrigger>
                            <TabsTrigger value="file"><Upload className="mr-2" />Image</TabsTrigger>
                            <TabsTrigger value="youtube"><Youtube className="mr-2" />YouTube</TabsTrigger>
                            <TabsTrigger value="audio"><Mic className="mr-2" />Audio</TabsTrigger>
                        </TabsList>
                    </CardHeader>
                    <CardContent>
                        <TabsContent value="text" className="mt-0">
                            <Textarea
                                placeholder="Paste text here to analyze its concepts..."
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                className="min-h-[200px]"
                            />
                        </TabsContent>
                        <TabsContent value="file" className="mt-0">
                            <Input
                                type="file"
                                ref={fileInputRef}
                                accept="image/png, image/jpeg, image/webp"
                            />
                            <p className="text-xs text-muted-foreground mt-2">Upload an image containing text (PNG, JPG).</p>
                        </TabsContent>
                        <TabsContent value="youtube" className="mt-0">
                            <Input
                                type="url"
                                placeholder="https://www.youtube.com/watch?v=..."
                                value={youtubeUrl}
                                onChange={(e) => setYoutubeUrl(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground mt-2">Enter a YouTube video URL to analyze its content.</p>
                        </TabsContent>
                        <TabsContent value="audio" className="mt-0">
                            <div className="flex flex-col items-center justify-center h-full text-center p-8 border rounded-lg">
                                <Mic className="h-12 w-12 text-muted-foreground/50 mb-4" />
                                <h3 className="text-lg font-semibold">Audio Analysis Coming Soon!</h3>
                                <p className="text-sm text-muted-foreground">
                                    Soon you'll be able to upload audio files for analysis.
                                </p>
                            </div>
                        </TabsContent>
                    </CardContent>
                    <CardFooter>
                        <Button onClick={handleGenerate} disabled={isLoading} className="w-full" size="lg">
                            {isLoading ? <Loader2 className="animate-spin" /> : <Wand2 />}
                             {isLoading ? 'Analyzing...' : 'Analyze & Visualize'}
                        </Button>
                    </CardFooter>
                </Tabs>
            </Card>
        </div>
    );

    const renderFlowView = () => (
        <div className="relative flex-1 w-full h-full border-t">
            {isLoading ? (
                <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : flowData && (
                <ReactFlow 
                    nodes={flowData.nodes} 
                    edges={flowData.edges} 
                    fitView 
                    className="cursor-grab active:cursor-grabbing bg-background"
                    nodesDraggable={true}
                    panOnDrag={true}
                >
                    <MiniMap nodeColor={'hsl(var(--primary))'} />
                    <Controls />
                    <Background color="hsl(var(--border))" variant={BackgroundVariant.Dots} gap={16} size={1} />
                </ReactFlow>
            )}
        </div>
    );

    return (
        <div className="flex flex-col flex-1 h-screen">
             <div className="p-4 md:p-6">
                 <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-full border border-primary/20">
                        <BrainCircuit className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Concept Map Generator</h1>
                        <p className="text-muted-foreground">Visualize connections between ideas from any source.</p>
                    </div>
                    {flowData && (
                        <Button variant="outline" onClick={() => setFlowData(null)} className="ml-auto">
                           <ArrowLeft className="mr-2" />
                            Create New Map
                        </Button>
                    )}
                </div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center">
                {flowData ? renderFlowView() : renderInputForm()}
            </div>
        </div>
    );
}
