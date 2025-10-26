import { useEffect, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, DollarSign, Calendar, MapPin, Users, Target, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Sponsor {
  id: string;
  name: string;
  logo_url: string;
  website: string;
  description: string;
  hackathons: Hackathon[];
}

interface Hackathon {
  id: string;
    name: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  status: 'upcoming' | 'live' | 'finished';
  totalPrizePool: number;
  teamCount: number;
  categories: string[];
}

const Sponsors = () => {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    generateSponsorData();
  }, []);

  const generateSponsorData = () => {
    const sponsorsData: Sponsor[] = [
      {
        id: "techcrunch",
        name: "TechCrunch",
        logo_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/TechCrunch_logo.svg/200px-TechCrunch_logo.svg.png",
        website: "https://techcrunch.com",
        description: "Leading technology media property, dedicated to obsessively profiling startups, reviewing new Internet products, and breaking tech news.",
        hackathons: [
          {
            id: "techcrunch-disrupt-2024",
            name: "TechCrunch Disrupt 2024",
            description: "The world's premier startup competition",
            location: "San Francisco, CA",
            startDate: "2024-11-15T09:00:00Z",
            endDate: "2024-11-17T18:00:00Z",
            status: "upcoming",
            totalPrizePool: 50000,
            teamCount: 120,
            categories: ["Best Overall", "AI/ML Innovation", "FinTech Solutions", "Social Impact"]
          }
        ]
      },
      {
        id: "mit",
        name: "MIT",
        logo_url: "https://upload.wikimedia.org/wikipedia/en/thumb/4/44/MIT_Seal.svg/200px-MIT_Seal.svg.png",
        website: "https://mit.edu",
        description: "Massachusetts Institute of Technology - a world-renowned private research university.",
        hackathons: [
          {
            id: "hackmit-2024",
            name: "HackMIT 2024",
            description: "MIT's premier hackathon",
            location: "Cambridge, MA",
            startDate: "2024-12-01T10:00:00Z",
            endDate: "2024-12-03T16:00:00Z",
            status: "upcoming",
            totalPrizePool: 30000,
            teamCount: 80,
            categories: ["Best Overall", "Social Impact", "Mobile App", "Healthcare Tech"]
          }
        ]
      },
      {
        id: "penn",
        name: "University of Pennsylvania",
        logo_url: "https://upload.wikimedia.org/wikipedia/en/thumb/9/9a/University_of_Pennsylvania_logo.svg/200px-University_of_Pennsylvania_logo.svg.png",
        website: "https://upenn.edu",
        description: "A private Ivy League research university in Philadelphia.",
        hackathons: [
          {
            id: "pennapps-2024",
            name: "PennApps 2024",
            description: "University of Pennsylvania's hackathon",
            location: "Philadelphia, PA",
            startDate: "2024-11-22T09:00:00Z",
            endDate: "2024-11-24T17:00:00Z",
            status: "upcoming",
            totalPrizePool: 25000,
            teamCount: 100,
            categories: ["Best Overall", "Healthcare Tech", "Blockchain", "Education"]
          }
        ]
      },
      {
        id: "microsoft",
        name: "Microsoft",
        logo_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Microsoft_logo.svg/200px-Microsoft_logo.svg.png",
        website: "https://microsoft.com",
        description: "Multinational technology corporation that develops, manufactures, licenses, supports and sells computer software, consumer electronics and personal computers.",
        hackathons: [
          {
            id: "microsoft-build-2024",
            name: "Microsoft Build Hackathon 2024",
            description: "Build the future with Microsoft technologies",
            location: "Seattle, WA",
            startDate: "2024-12-10T08:00:00Z",
            endDate: "2024-12-12T20:00:00Z",
            status: "upcoming",
            totalPrizePool: 40000,
            teamCount: 150,
            categories: ["Azure Innovation", "AI/ML Solutions", "Developer Tools", "Cloud Native"]
          }
        ]
      },
      {
        id: "google",
        name: "Google",
        logo_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/200px-Google_2015_logo.svg.png",
        website: "https://google.com",
        description: "Multinational technology company specializing in Internet-related services and products.",
        hackathons: [
          {
            id: "google-io-hackathon-2024",
            name: "Google I/O Hackathon 2024",
            description: "Innovate with Google technologies",
            location: "Mountain View, CA",
            startDate: "2024-11-30T09:00:00Z",
            endDate: "2024-12-02T18:00:00Z",
            status: "upcoming",
            totalPrizePool: 35000,
            teamCount: 90,
            categories: ["Android Development", "Web Technologies", "Machine Learning", "Cloud Computing"]
          }
        ]
      }
    ];

    setSponsors(sponsorsData);
    setLoading(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'upcoming':
        return <Badge className="bg-blue-100 text-blue-800">Upcoming</Badge>;
      case 'live':
        return <Badge className="bg-green-100 text-green-800">Live</Badge>;
      case 'finished':
        return <Badge className="bg-gray-100 text-gray-800">Finished</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>;
    }
  };

  const goToHackathon = (hackathonId: string) => {
    navigate(`/hackathons?hackathon=${hackathonId}`);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <main className="flex-1 p-8">
          <Header />
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-muted rounded"></div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 p-8">
        <Header />
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Sponsors</h1>
          <p className="text-muted-foreground">Discover hackathons by sponsor and place your bets</p>
        </div>

          <div className="grid gap-6">
          {sponsors.map((sponsor) => (
              <Card key={sponsor.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                  <img
                    src={sponsor.logo_url}
                    alt={sponsor.name}
                        className="h-12 w-12 object-contain"
                  />
                <div>
                        <CardTitle className="text-xl">{sponsor.name}</CardTitle>
                        <p className="text-muted-foreground text-sm">{sponsor.description}</p>
                        <div className="flex items-center mt-2">
                          <ExternalLink className="h-4 w-4 text-muted-foreground mr-1" />
                          <a 
                            href={sponsor.website} 
                      target="_blank"
                      rel="noopener noreferrer"
                            className="text-primary hover:text-primary/80 text-sm"
                    >
                            {sponsor.website}
                    </a>
                </div>
              </div>
                  </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">
                        {sponsor.hackathons.length} Hackathon{sponsor.hackathons.length !== 1 ? 's' : ''}
                  </div>
                </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {sponsor.hackathons.map((hackathon) => (
                      <div key={hackathon.id} className="border rounded-lg p-4 bg-muted/50">
                        <div className="flex items-center justify-between mb-3">
                  <div>
                            <h3 className="font-semibold text-lg">{hackathon.name}</h3>
                            <p className="text-muted-foreground text-sm">{hackathon.description}</p>
                          </div>
                          <div className="text-right">
                            {getStatusBadge(hackathon.status)}
                  </div>
                </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div className="flex items-center">
                            <DollarSign className="h-4 w-4 text-green-500 mr-2" />
                  <div>
                              <div className="text-sm font-semibold">${hackathon.totalPrizePool.toLocaleString()}</div>
                              <div className="text-xs text-muted-foreground">Prize Pool</div>
                  </div>
                </div>
                          <div className="flex items-center">
                            <Users className="h-4 w-4 text-blue-500 mr-2" />
                  <div>
                              <div className="text-sm font-semibold">{hackathon.teamCount}</div>
                              <div className="text-xs text-muted-foreground">Teams</div>
                  </div>
                </div>
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 text-purple-500 mr-2" />
                            <div>
                              <div className="text-sm font-semibold">{hackathon.location}</div>
                              <div className="text-xs text-muted-foreground">Location</div>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 text-orange-500 mr-2" />
                            <div>
                              <div className="text-sm font-semibold">
                                {new Date(hackathon.startDate).toLocaleDateString()}
                        </div>
                              <div className="text-xs text-muted-foreground">Start Date</div>
                    </div>
                          </div>
                        </div>

                        <div className="mb-4">
                          <div className="text-sm font-medium mb-2">Prize Categories:</div>
                          <div className="flex flex-wrap gap-2">
                            {hackathon.categories.map((category) => (
                              <Badge key={category} variant="outline" className="text-xs">
                                {category}
                            </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="flex justify-end">
                          <Button 
                            onClick={() => goToHackathon(hackathon.id)}
                          >
                            <Target className="h-4 w-4 mr-2" />
                            Go to Hackathon
                          </Button>
                    </div>
                    </div>
                    ))}
                  </div>
                </CardContent>
                </Card>
            ))}
          </div>
      </main>
    </div>
  );
};

export default Sponsors;