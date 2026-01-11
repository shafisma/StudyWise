'use client';

import { useState, useCallback } from 'react';
import ReactFlow, {
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Wand2, Download, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { generateConceptMap, type ConceptMapInput, type ConceptMapOutput } from '@/ai/flows/generate-concept-map';
import { useToast } from '@/hooks/use-toast';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

const initialNodes: Node[] = [
  {
    id: '1',
    data: { label: 'Enter a topic to generate a concept map' },
    position: { x: 250, y: 250 },
    type: 'input',
  },
];

const initialEdges: Edge[] = [];

export default function ConceptMapPage() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [topic, setTopic] = useState('');
  const [details, setDetails] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const mapDataToFlowElements = (data: ConceptMapOutput) => {
    // Basic layout algorithm (simplified for this demo)
    // A real app would use dagre or elkjs for auto-layout
    const newNodes: Node[] = (data.concepts || []).map((concept, index) => {
        // Distribute nodes in a circle/spiral or grid
        const angle = (index / (data.concepts.length || 1)) * 2 * Math.PI;
        const radius = 200 + (index * 20); 
        const x = 400 + Math.cos(angle) * radius;
        const y = 300 + Math.sin(angle) * radius;

        return {
            id: concept.id,
            data: { label: concept.label, description: concept.description },
            position: { x, y },
            type: index === 0 ? 'input' : 'default', // Assume first is root for styling
        };
    });

    const newEdges: Edge[] = (data.relationships || []).map((rel, i) => ({
        id: `e-${rel.source}-${rel.target}-${i}`,
        source: rel.source,
        target: rel.target,
        label: rel.relation,
        type: 'smoothstep',
        markerEnd: {
            type: MarkerType.ArrowClosed,
        },
        animated: true,
    }));

    setNodes(newNodes);
    setEdges(newEdges);
  };

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast({ variant: 'destructive', title: 'Topic is required.' });
      return;
    }

    setIsLoading(true);
    try {
      // In a real implementation, we would call the AI service
      // For now we simulate or use the actual flow if available
      const input: ConceptMapInput = { topic, additionalDetails: details };
      // NOTE: This assumes generateConceptMap returns the structure we need.
      // If it returns a raw string/markdown, we'd need to parse it here.
      // Based on file names, it seems to return a structured object.
      
      const result = await generateConceptMap(input);
      
      if (result) {
         mapDataToFlowElements(result);
         toast({ title: 'Concept Map Generated', description: `Created map for: ${topic}` });
      }

    } catch (error) {
      console.error('Error generating map:', error);
      toast({
        variant: 'destructive',
        title: 'Generation Failed',
        description: 'Could not generate concept map. Try a different topic.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    const element = document.querySelector('.react-flow') as HTMLElement;
    if (!element) return;

    try {
        const canvas = await html2canvas(element);
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
            orientation: 'landscape',
        });
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`concept-map-${topic.replace(/\s+/g, '-')}.pdf`);
        
        toast({ title: 'Downloaded', description: 'Concept map saved as PDF.' });
    } catch (err) {
        console.error('Download failed', err);
        toast({ variant: 'destructive', title: 'Download Failed' });
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] p-4 md:p-6 gap-6">
       <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Concept Mapper</h1>
          <p className="text-muted-foreground">Visualize relationships between complex ideas.</p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" onClick={() => {
                setNodes(initialNodes);
                setEdges(initialEdges);
                setTopic('');
                setDetails('');
            }}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset
            </Button>
            <Button variant="secondary" onClick={handleDownload} disabled={nodes.length <= 1}>
                <Download className="mr-2 h-4 w-4" />
                Export PDF
            </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
        <Card className="lg:col-span-1 p-4 flex flex-col gap-4 h-fit">
            <div className="space-y-2">
                <Label>Topic</Label>
                <Input 
                    placeholder="e.g. Photosynthesis" 
                    value={topic} 
                    onChange={e => setTopic(e.target.value)}
                />
            </div>
            <div className="space-y-2">
                <Label>Details (Optional)</Label>
                <Textarea 
                    placeholder="Focus on specific aspects..." 
                    value={details} 
                    onChange={e => setDetails(e.target.value)}
                    className="min-h-[100px]"
                />
            </div>
            <Button onClick={handleGenerate} disabled={isLoading} className="w-full">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                Generate Map
            </Button>

            <div className="mt-4 p-4 bg-muted/50 rounded-lg text-sm text-muted-foreground">
                <p className="font-semibold mb-1">Tips:</p>
                <ul className="list-disc list-inside space-y-1">
                    <li>Start with a broad topic</li>
                    <li>Add specific focus details</li>
                    <li>Drag nodes to rearrange</li>
                    <li>Export to study later</li>
                </ul>
            </div>
        </Card>

        <Card className="lg:col-span-3 h-[600px] lg:h-full border-2 border-muted overflow-hidden relative">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                fitView
            >
                <Controls />
                <Background />
            </ReactFlow>
            {isLoading && (
                <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-50">
                    <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-10 w-10 animate-spin text-primary" />
                        <p className="font-medium text-lg">Mapping Concepts...</p>
                    </div>
                </div>
            )}
        </Card>
      </div>
    </div>
  );
}
