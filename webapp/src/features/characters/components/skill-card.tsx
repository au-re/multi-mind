import { Box, Input, Text } from "@chakra-ui/react";
import { Crown, Eye, Flame, Grid3x3, Heart, MessageCircle, Search, Shield, Zap } from "lucide-react";
import type { TraitConfig, TraitId } from "@/features/traits";
import { clampSkill, TRAIT_FLAVOR } from "@/features/traits";

const ICON_MAP = {
  Shield,
  Heart,
  MessageCircle,
  Eye,
  Flame,
  Zap,
  Grid3x3,
  Crown,
  Search,
} as const;

interface SkillCardProps {
  trait: TraitConfig;
  onChange?: (traitId: TraitId, skill: number) => void;
}

export const SkillCard = (props: SkillCardProps) => {
  const { trait, onChange } = props;
  const flavor = TRAIT_FLAVOR[trait.id];
  const Icon = ICON_MAP[flavor.icon as keyof typeof ICON_MAP];

  return (
    <Box
      position="relative"
      overflow="hidden"
      borderRadius="lg"
      p="4"
      h="100%"
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
      cursor="default"
      transition="all 0.2s"
      _hover={{
        transform: "translateY(-2px)",
      }}
      style={{
        background: `linear-gradient(145deg, ${flavor.color}18 0%, ${flavor.color}08 100%)`,
        border: `1px solid ${flavor.color}30`,
        boxShadow: `0 0 20px ${flavor.color}10`,
      }}
    >
      {/* Skill level badge */}
      <Box position="absolute" top="4" right="4" zIndex="1">
        {onChange ? (
          <Input
            type="number"
            value={trait.skill}
            min={0}
            w="56px"
            h="40px"
            textAlign="center"
            fontWeight="bold"
            fontSize="lg"
            borderRadius="full"
            p="0"
            cursor="text"
            style={{
              background: `${flavor.color}20`,
              borderColor: `${flavor.color}60`,
              color: flavor.color,
            }}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => {
              const val = Number.parseInt(e.target.value, 10);
              if (!Number.isNaN(val)) {
                onChange(trait.id, clampSkill(val));
              }
            }}
          />
        ) : (
          <Box
            w="40px"
            h="40px"
            borderRadius="full"
            display="flex"
            alignItems="center"
            justifyContent="center"
            style={{
              background: `${flavor.color}20`,
              border: `2px solid ${flavor.color}60`,
            }}
          >
            <Text fontWeight="bold" fontSize="lg" style={{ color: flavor.color }}>
              {trait.skill}
            </Text>
          </Box>
        )}
      </Box>

      {/* Icon + title */}
      <Box>
        <Box mb="2" style={{ color: flavor.color }} opacity={0.8}>
          <Icon size={28} />
        </Box>
        <Text
          fontSize="xl"
          fontWeight="bold"
          letterSpacing="wide"
          textTransform="uppercase"
          style={{ color: flavor.color }}
        >
          {trait.label}
        </Text>
        <Text fontSize="xs" fontStyle="italic" color="fg.muted" mt="1">
          {flavor.tagline}
        </Text>
      </Box>

      {/* Description */}
      <Text fontSize="sm" color="fg.muted" lineHeight="tall" mt="3">
        {flavor.description}
      </Text>

      {/* Skill bar */}
      <Box mt="3">
        <Box h="3px" borderRadius="full" overflow="hidden" style={{ background: `${flavor.color}15` }}>
          <Box
            h="100%"
            borderRadius="full"
            transition="width 0.5s ease"
            style={{
              width: `${Math.min((trait.skill / 20) * 100, 100)}%`,
              background: `linear-gradient(90deg, ${flavor.color}80, ${flavor.color})`,
            }}
          />
        </Box>
      </Box>
    </Box>
  );
};
